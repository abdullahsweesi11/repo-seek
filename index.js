import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import optionUtils from "./utils/options.js";

// TODO: Process arguments

async function processArguments() {
    const argv = yargs(hideBin(process.argv))
    .array(["topic", "language"])           // these options can take multiple arguments
    .boolean("force")
    .options(optionUtils.OPTIONS)
    .strictOptions(true)
    .fail((msg, err, yargs) => {
        const errorMessage = msg || err.message || "Unknown parsing error"
        throw new Error(`Parsing error: ${errorMessage}`)
    })
    .exitProcess(false)
    .parserConfiguration({
        'camel-case-expansion': false
    })
    .parse()

    const inputOptions = Object.keys(argv).filter(key => key !== "_" && key !== "$0")
    console.log(inputOptions)

    try {
        for (const option of inputOptions) {
            await optionUtils.validateArguments(option, argv[option], argv)
        }
    } catch (err) {
        console.log("\n")
        throw new Error(`Parsing error: ${err.msg}`)
    }
}


// TODO: Formulate the request(s) to Github API
// Note: multiple requests may be sent simply because users want a lot of results (+100)

// TODO: Send the request(s)

// TODO: Format results for output

async function main() {
    await processArguments()
}

main().catch(err => {
    console.error(`Unhandled error:  + ${err.message}`)
    process.exit(1)
})