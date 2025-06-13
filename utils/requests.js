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

export default {
    validateQueryComponents
};