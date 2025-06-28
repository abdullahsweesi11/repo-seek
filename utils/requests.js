import rlPromises from "node:readline/promises";

const BASE_URL = "https://api.github.com/search/repositories";

const RATE_DATA_NAME = "rate-limit.json";

async function confirmMultipleRequests(num) {
	const rl = rlPromises.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	let answer = await rl.question(
		`This command will result in ${num} requests. Continue (Y/n)? `,
	);
	rl.close();

	answer = answer.trim().toLowerCase();
	if (["n", "no"].includes(answer)) return false;
	return true;
}

function queryStringHelper(argv) {
	// Embed sort, order and limit into the query strings

	let prefix = "";
	const keys = Object.keys(argv);

	if (keys.includes("sort")) prefix += `sort=${argv.sort}&`;
	if (keys.includes("order")) prefix += `order=${argv.order}&`;

	const limit = argv.limit;
	const results = [];

	if (limit === 30) {
        if (prefix)
		    results.push(prefix);
	} else {
		if (limit <= 100) {
			results.push(`${prefix}per_page=${limit}`);
		} else {
			for (let i = 1; i <= Math.ceil(limit / 100); i++) {
				if (i * 100 < limit) results.push(`${prefix}page=${i}&per_page=100`);
				else
					results.push(`${prefix}page=${i}&per_page=${limit - (i - 1) * 100}`);
			}
		}
	}

	return results;
}

function generateQueryStrings(argv) {
	const queryArray = [];
	const starsArray = [".."];
	const createdArray = [".."];

	const options = Object.keys(argv);

	for (const option of [
		"topic",
		"language",
		"stars-min",
		"stars-max",
		"created-before",
		"created-after",
	]) {
		if (options.includes(option)) {
			switch (option) {
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
			if (starsArray.indexOf("..") === 0) starsArray.unshift("*");
			else if (starsArray.indexOf("..") === 1) starsArray.push("*");
		}

		queryArray.push(`stars:${starsArray.join("")}`);
	}

	if (createdArray.length > 1) {
		if (createdArray.length === 2) {
			if (createdArray.indexOf("..") === 0) createdArray.unshift("*");
			else if (createdArray.indexOf("..") === 1) createdArray.push("*");
		}

		queryArray.push(`created:${createdArray.join("")}`);
	}

	const results = [];
	const helperResults = queryStringHelper(argv);
	if (helperResults.length > 0) {
		for (const queryPart of helperResults)
			results.push(
				`${BASE_URL}?q=${encodeURIComponent(queryArray.join(" "))}&${queryPart}`,
			);
	} else {
		return [`${BASE_URL}?q=${encodeURIComponent(queryArray.join(" "))}`]
	}
    
	return results;
}

export default {
	generateQueryStrings,
	confirmMultipleRequests,
	RATE_DATA_NAME,
};
