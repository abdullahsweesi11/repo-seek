const HEADERS = {

};

function validateQueryComponents(argv) {
    const queryComponents = {
        "topic": 0, "language": 0,
        "stars": 0, "created": 0
    };

    for (const [key, value] of Object.entries(argv)) {
        if (key === "topic" || key === "language") queryComponents[key] += value.length;
        if (key.startsWith("stars") || key.startsWith("created")) {
            const prefix = key.startsWith("stars") ? "stars" : "created";
            queryComponents[prefix] = Math.min(1 + queryComponents[prefix], 1);
        }
    }

    if (Object.values(queryComponents).reduce((acc, val) => acc + val) > 6)
        throw new Error(`Query exceeds maximum of 6 components (i.e. topic, language, stars, created). See documentation for details.`);
}

function generateQueryString(argv) {
    const queryArray = [];
    const starsArray = [".."];
    const createdArray = [".."];

    const options = Object.keys(argv);

    for (const option of ["topic", "language", "stars-min", "stars-max", "created-before", "created-after"]) {
        if (options.includes(option)) {
            switch(option) {
                case "topic":
                case "language":
                    argv[option].forEach((val) => queryArray.push(`${option}:${val}`));
                    break;
                case "stars-min":
                    starsArray.unshift(argv["stars-min"]);
                    break;
                case "stars-max":
                    starsArray.push(argv["stars-max"]);
                    break;
                case "created-before":
                    createdArray.unshift(argv["created-before"]);
                    break;
                case "created-after":
                    createdArray.push(argv["created-after"]);
                    break;
            }
        }
    }

    if (starsArray.length > 1) {
        if (starsArray.length === 2) {
            if (starsArray.indexOf("..") === 0)
                starsArray.unshift("*");
            else if (starsArray.indexOf("..") === 1)
                starsArray.push("*");
        }

        queryArray.push(`stars:${starsArray.join("")}`);
    }

    if (createdArray.length > 1) {
        if (createdArray.length === 2) {
            if (createdArray.indexOf("..") === 0)
                createdArray.unshift("*");
            else if (createdArray.indexOf("..") === 1)
                createdArray.push("*");
        }

        queryArray.push(`created:${createdArray.join("")}`);
    }

    return queryArray.join(" ");
}

export default {
    validateQueryComponents,
    generateQueryString
};