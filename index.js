import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import optionUtils from "./utils/options.js";

// TODO: Process arguments

async function processArguments() {
    const argv = yargs(hideBin(process.argv))
    .options(optionUtils.OPTIONS)
    .strictOptions(true)
    .fail((msg, err, _) => {
        const errorMessage = msg || err.message || "Unknown parsing error"
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
    // const queryParts = ["topic", "language", "stars-min", "stars-max", "created-before", "created-after"]
}

// Note: multiple requests may be sent simply because users want a lot of results (+100)

// TODO: Send the request(s)

// TODO: Format results for output

async function main() {
    let argv;
    try {
        argv = await processArguments();
    } catch (err) {
        console.error(`\nParsing error:- ${err.message}`);
        process.exit(1);
    }

    let request;
    try {
        request = await processRequest(argv);
    } catch (err) {
        console.error(`\nValidation error:- ${err.message}`);
        process.exit(1);
    }


}

main().catch(err => {
    console.error(`Unhandled error:-  + ${err.message}`)
    process.exit(1)
})