
// TODO: Design the specification of available options and their metadata

// const OPTIONS = ["topic", "language", "stars-min", "stars-max", "created", "sort", "order", "limit", "output-format", "output-file", "force"]
// Main change: refactor options so that it can be fed straight into yargs.options, so that each option has:
//  - alias(es) (optional)
//  - type
//  - default (optional)
//  - description (describe)
//  - choices

const OPTIONS = {
    "topic": {
        type: "array",
        default: [],
        describe: "Filters resulting repositories based on the specified topic(s)"
    },
    "language": {
        type: "array",
        default: [],
        describe: "Filters resulting repositories based on the specified language(s)"
    },
    "sort": {
        type: "string",
        describe: "Sorts resulting repositories based on the specified attribute",
        choices: ["stars", "forks", "help-wanted-issues", "updated"]
    },
    "order": {
        type: "string",
        describe: "Applies sorting in the specified order",
        default: "desc",
        choices: ["desc", "asc"]
    },

    "output-format": {
        type: "string",
        describe: "Outputs results in the specified format",
        default: "pretty",
        choices: ["pretty", "json", "csv"]
    },
}

function validateArguments(option, args) {
    switch (option) {
        case "topic":
        case "language":
            break;
        case "stars-min":
        case "starsMin":
            if ((!args && args !== 0) || typeof args !== "number") throw new Error(`An invalid argument was provided for --stars-min`)
            break;
        default:
            throw new Error(`Unaccounted-for argument`)
    }
}

export default {
    validateArguments, OPTIONS
}