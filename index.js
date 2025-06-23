import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import optionUtils from "./utils/options.js";
import requestUtils from "./utils/requests.js";
import tryWithErrorHandling from "./utils/utils.js";

async function processArguments() {
    const argv = yargs(hideBin(process.argv))
    .options(optionUtils.OPTIONS)
    .check((argv, _) => {
        if (argv['limit'] <= 0 || argv['limit'] > 500)
            throw new Error("The provided limit is not within the allowed range (1-500).");

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


// TODO: Formulate the request(s) to Github API and validate them

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

        if (isNaN(total_count))
            total_count = responseJson['total_count'];
        if (!incomplete_results && responseJson['incomplete_results'])
            incomplete_results = true;

        items.push(...responseJson['items'])
    }

    return {
        total_count,
        incomplete_results,
        items
    }
    
}

// TODO: Format results for output

async function main() {
    const argv = await tryWithErrorHandling(processArguments, "Parsing");
    const requestUrls = await tryWithErrorHandling(() => processRequest(argv), "Validation");

    const result = await tryWithErrorHandling(() => sendRequests(requestUrls), "Server");
    console.log(result)

    // call a function that checks that nothing went wrong (incomplete_results)
    // call a function that formats output based on user preference
}

main().catch(err => {
    console.error(`Unhandled error:-  + ${err.message}`)
    process.exit(1)
})