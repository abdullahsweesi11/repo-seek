import fs from "node:fs";
import { json2csv } from "json-2-csv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { fileURLToPath } from "node:url";

import optionUtils from "./utils/options.js";
import requestUtils from "./utils/requests.js";
import tmpUtils from "./utils/tmp.js";
import tryWithErrorHandling from "./utils/utils.js";

// if authentication is added, these attributes need to be set dynamically

const rateLimitInfo = {
	requestsRemaining: 10,
	requestsLimit: 10,
	requestsRefresh: null,
};

export async function processArguments() {
	const argv = yargs(hideBin(process.argv))
		.options(optionUtils.OPTIONS)
		.check((argv, _) => {
            if (argv._.length === 0)
                throw new Error(
                   "Search query cannot be empty" 
                );

			const keys = Object.keys(argv);
			if (argv.limit <= 0 || argv.limit > 500)
				throw new Error(
					"The provided limit is not within the allowed range (1-500).",
				);

			if (
				argv.limit > optionUtils.STDOUT_LIMIT &&
				argv["output-format"] === "stdout"
			) {
				console.warn(
					`Warning: Limit capped at ${optionUtils.STDOUT_LIMIT} to prevent terminal flooding. Use JSON or CSV for more results.\n`,
				);
				argv.limit = optionUtils.STDOUT_LIMIT;
			}

			if (keys.includes("order") && !keys.includes("sort"))
				throw new Error(
					"Order cannot be configured unless sorting criteria is specified.",
				);

			return true;
		})
		.strictOptions(true)
		.fail((msg, err, _) => {
			const errorMessage = msg || err.message || "Unknown parsing error.";
			throw new Error(errorMessage);
		})
		.exitProcess(false)
		.parserConfiguration({
			"camel-case-expansion": false,
		})
		.parse();

	const inputOptions = Object.keys(argv).filter(
		(key) => key !== "_" && key !== "$0",
	);

	for (const option of inputOptions) {
		await optionUtils.validateArguments(option, argv[option], argv);
	}

	return argv;
}

export function processRequests(argv) {
	// Only 5 AND, OR or NOT in query are allowed, per GitHub API
	// Since only AND is used, a maximum of 6 components in the query is enforced
	requestUtils.validateQueryComponents(argv);
    const urls = requestUtils.generateQueryStrings(argv);
	return urls;
}

export async function sendRequests(urls) {
	const items = [];
	let total_count = NaN;
	let incomplete_results = false;

	for (const url of urls) {
		const response = await fetch(url);
		const responseJson = await response.json();

		if (response.status !== 200) {
			if (response.status === 403) {
				rateLimitInfo.requestsRefresh =
					+response.headers.get("x-ratelimit-reset");
				tmpUtils.writeTempData(rateLimitInfo, requestUtils.RATE_DATA_NAME);
				throw new Error(
					`The rate limit of ${rateLimitInfo.requestsLimit} requests/min has been reached. Please try again soon.`,
				);
			} else throw new Error(`(Forwarded from GitHub:) ${responseJson.message}`);
		}

		if (Number.isNaN(total_count)) total_count = responseJson.total_count;
		if (!incomplete_results && responseJson.incomplete_results)
			incomplete_results = true;
		rateLimitInfo.requestsRemaining = response.headers.get(
			"x-ratelimit-remaining",
		);

		if (!Array.isArray(responseJson.items))
			throw new Error("Unexpected response format from Github.");
		items.push(...responseJson.items);
	}

	return {
		total_count,
		incomplete_results,
		items,
	};
}

export async function displayResults(format, filename, results) {
	if (format === "stdout") {
		console.log(results.items);
	} else if (format === "json") {
		fs.writeFileSync(filename, JSON.stringify(results.items), "utf-8");
		console.log(`\nResults can be found in '${filename}'`);
	} else {
		fs.writeFileSync(filename, await json2csv(results.items), "utf-8");
		console.log(`\nResults can be found in '${filename}'`);
	}

	console.log(
		`\nRequests remaining: ${rateLimitInfo.requestsRemaining} from ${rateLimitInfo.requestsLimit} per minute`,
	);

	console.log(`\nTotal count: ${results.total_count}`);
	console.log(`Results returned: ${results.items.length}\n`);
}

export async function main() {
	const rateLimitData = tmpUtils.readTempData(requestUtils.RATE_DATA_NAME);
	const currentTime = Math.floor(Date.now() / 1000);
	if (rateLimitData?.requestsRefresh > currentTime) {
		throw new Error(
			`The rate limit of ${rateLimitInfo.requestsLimit} requests/min has been reached. Please try again soon.`,
		);
	}

	const argv = await tryWithErrorHandling(processArguments, "Parsing");
	const requestUrls = await tryWithErrorHandling(
		() => processRequests(argv),
		"Validation",
	);
	if (requestUrls.length > 1) {
		const confirmed = await requestUtils.confirmMultipleRequests(
			requestUrls.length,
		);
		if (!confirmed) {
			console.log("Terminating... No requests sent.");
			process.exit(1);
		}
	}
	const results = await tryWithErrorHandling(
		() => sendRequests(requestUrls),
		"Server",
	);
	await tryWithErrorHandling(
		() => displayResults(argv["output-format"], argv["output-name"], results),
		"Output",
	);
	if (results.incomplete_results)
		console.warn("Warning:- Results may be incomplete due to request timeout.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((err) => {
        if (err.name && err.name !== "Error")
            console.error(`${err.name} error:- \n${err.message}`);
        else
            console.error(`Unexpected error:- \n${err.message}`);
    });
}
