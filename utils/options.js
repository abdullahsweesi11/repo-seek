
// TODO: Design the specification of available options and their metadata

// const OPTIONS = ["topic", "language", "stars-min", "stars-max", "created", "sort", "order", "limit", "output-format", "output-file", "force"]
// Main change: refactor options so that it can be fed straight into yargs.options, so that each option has:
//  - alias(es) (optional)
//  - type
//  - default (optional)
//  - description (describe)
//  - choices (if relevant)

const OPTIONS = {
    "topic": {
        type: "array",
        default: [],
        describe: "Filters in repositories with the specified topic(s)"
    },
    "language": {
        type: "array",
        default: [],
        describe: "Filters in repositories with the specified language(s)"
    },
    "stars-min": {
        type: "number",
        describe: "Filters out repositories less than the specified minimum",
        default: 0
    },
    "stars-max": {
        type: "number",
        describe: "Filters out repositories greater than the specified maximum",
    },
    "created-before": {
        type: "string",
        describe: "Filters out repositories on or after the specified date",
        choices: ["stars", "forks", "help-wanted-issues", "updated"]
    },
    "created-after": {
        type: "string",
        describe: "Filters out repositories on or before the specified date",
        choices: ["stars", "forks", "help-wanted-issues", "updated"]
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
    "limit": {
        type: "number",
        describe: "Sets an upper limit for the number of results (max 500)",
        default: 100
    },
    "output-format": {
        type: "string",
        describe: "Outputs results in the specified format",
        default: "pretty",
        choices: ["pretty", "json", "csv"]
    },
    "output-file": {
        type: "string",
        describe: "Outputs results into the specified file (cannot be set if output-format is pretty)",
    },
    "force": {
        type: "boolean",
        describe: "Toggles forced execution, without any prompts",
        default: false,
    },
}

// Those options which need extra argument validation:
// - Limit (to prevent limits greater than 500, hence max 5 API requests)
// - Output file (to check if the path is valid, and if the file already exists)

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