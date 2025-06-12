import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import optionUtils from "./utils/options.js";

// TODO: Process arguments

let argv;

try {
    argv = yargs(hideBin(process.argv))
        .array(["topic", "language"])           // these options can take multiple arguments
        .boolean("force")
        .options(optionUtils.OPTIONS)
        .check((argv, _) => {
            const inputOptions = Object.keys(argv).filter(key => key !== "_" && key !== "$0")
            inputOptions.forEach((option) => {
                optionUtils.validateArguments(option, argv[option])
            })

            return true
        })
        .strictOptions(true)
        .fail((msg, err, yargs) => {
            const errorMessage = msg || err.message || "Unknown parsing error"
            throw new Error(`\nParsing error:\n${errorMessage}`)
        })
        .exitProcess(false)
        .parserConfiguration({
            'camel-case-expansion': false
        })
        .parse()
} catch (err) {
    console.error(err.message)
    process.exit(1)
}

console.log(argv)

// TODO: Formulate the request(s) to Github API
// Note: multiple requests may be sent simply because users want a lot of results (+100)

// TODO: Send the request(s)

// TODO: Format results for output