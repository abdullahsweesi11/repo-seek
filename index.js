import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import fs from "fs";
import { json2csv } from 'json-2-csv';

import optionUtils from "./utils/options.js";
import requestUtils from "./utils/requests.js";
import tryWithErrorHandling from "./utils/utils.js";

// if authentication is added, these attributes need to be set dynamically

const rateLimitInfo = {
    requestsRemaining: 10,
    requestsLimit: 10
}


async function processArguments() {
    const argv = yargs(hideBin(process.argv))
    .options(optionUtils.OPTIONS)
    .check((argv, _) => {
        const keys = Object.keys(argv);
        if (argv['limit'] <= 0 || argv['limit'] > 500)
            throw new Error("The provided limit is not within the allowed range (1-500).");

        if (argv['limit'] > 50 && argv['output-format'] === "stdout")
            argv['limit'] = 50;

        if (keys.includes('order') && !keys.includes('sort'))
            throw new Error("Order cannot be configured unless sorting criteria is specified.");

        return true;
    })
    .strictOptions(true)
    .fail((msg, err, _) => {
        const errorMessage = msg || err.message || "Unknown parsing error."
        throw new Error(errorMessage)
    })
    .exitProcess(false)
    .parserConfiguration({
        'camel-case-expansion': false
    })
    .parse();

    const inputOptions = Object.keys(argv).filter(key => key !== "_" && key !== "$0");

    for (const option of inputOptions) {
        await optionUtils.validateArguments(option, argv[option], argv);
    }

    return argv;
}

function processRequest(argv) {
    // Only 5 AND, OR or NOT in query are allowed, per GitHub API
    // Since only AND is used, a maximum of 6 components in the query is enforced
    requestUtils.validateQueryComponents(argv);

    return requestUtils.generateQueryStrings(argv);
}

// Note: multiple requests may be sent simply because users want a lot of results (+100)
// TODO: Send the request(s) - extend this to check for rate problems

async function sendRequests(urls) {
    let items = [];
    let total_count = NaN;
    let incomplete_results = false;

    for (const url of urls) {
        const response = await fetch(url);
        const responseJson = await response.json();

        if (response.status !== 200) {
            if (response.status === 403) {
                const timeLeft = (new Date(+response.headers.get('x-ratelimit-reset') * 1000)) - (new Date());
                throw new Error(`The rate limit of ${rateLimitInfo.requestsLimit} requests/min has been reached. This resets in ${Math.ceil(timeLeft / 1000)} seconds.`);
            }
            else
                throw new Error(responseJson.message);
        }

        if (isNaN(total_count))
            total_count = responseJson['total_count'];
        if (!incomplete_results && responseJson['incomplete_results'])
            incomplete_results = true;
        rateLimitInfo.requestsRemaining = response.headers.get("x-ratelimit-remaining");
        

        items.push(...responseJson['items']);
    }

    return {
        total_count,
        incomplete_results,
        items
    };
}

async function displayResults(format, filename, results) {
    if (format === "stdout") {
        console.log(results.items);
    } else if (format === "json") {
        fs.writeFileSync(filename, JSON.stringify(results.items), "utf-8");
        console.log(`\nResults can be found in '${filename}'`)
    } else {
        fs.writeFileSync(filename, await json2csv(results.items), "utf-8");
        console.log(`\nResults can be found in '${filename}'`)
    }

    console.log(`\nRequests remaining: ${rateLimitInfo.requestsRemaining} from ${rateLimitInfo.requestsLimit} per minute`)

    console.log(`\nTotal count: ${results.total_count}`);
    console.log(`Results returned: ${results.items.length}\n`)
}

async function main() {
    const argv = await tryWithErrorHandling(processArguments, "Parsing");
    const requestUrls = await tryWithErrorHandling(() => processRequest(argv), "Validation");
    const results = await tryWithErrorHandling(() => sendRequests(requestUrls), "Server");
    await tryWithErrorHandling(() => displayResults(argv['output-format'], argv['output-name'], results), "Output");
    if (results['incomplete_results'])
        console.warn("Warning:- Results may be incomplete due to request timeout.")
}

main().catch(err => {
    console.error(`Unhandled error:-  + ${err.message}`)
    process.exit(1)
})