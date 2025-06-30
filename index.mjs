#!/usr/bin/env node

import fs from "node:fs";
import { json2csv } from "json-2-csv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import optionUtils from "./utils/options/options.js";
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
		.check(optionUtils.validateArguments)
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

	return argv;
}

export async function sendRequests(urls, raw) {
	let items = [];
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
			} else
				throw new Error(`(Forwarded from GitHub:) ${responseJson.message}`);
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

	if (!raw)
		items = items.map((item) => ({
			id: item?.id,
			name: item?.name,
			full_name: item?.full_name,
			description: item?.description,
			html_url: item?.html_url,
			homepage: item?.homepage,
			language: item?.language,
			stargazers_count: item?.stargazers_count,
			forks_count: item?.forks_count,
			open_issues_count: item?.open_issues_count,
			watchers_count: item?.watchers_count,
			has_issues: item?.has_issues,
			has_projects: item?.has_projects,
			has_downloads: item?.has_downloads,
			has_wiki: item?.has_wiki,
			has_pages: item?.has_pages,
			has_discussions: item?.has_discussions,
			updated_at: item?.updated_at,
			license: {
				name: item?.license?.name,
			},
			owner: {
				login: item?.owner?.login,
				html_url: item?.owner?.html_url,
				avatar_url: item?.owner?.avatar_url, // profile picture url
			},
		}));

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
		() => requestUtils.generateQueryStrings(argv),
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
		() => sendRequests(requestUrls, argv.raw),
		"Server",
	);
	await tryWithErrorHandling(
		() => displayResults(argv["output-format"], argv["output-name"], results),
		"Output",
	);
	if (results.incomplete_results)
		console.warn("Warning:- Results may be incomplete due to request timeout.");
}

if (process.argv[1]?.endsWith("repo-seek")) {
	main().catch((err) => {
		if (err.name && err.name !== "Error")
			console.error(`${err.name} error:- \n${err.message}`);
		else console.error(`Unexpected error:- \n${err.message}`);
	});
}
