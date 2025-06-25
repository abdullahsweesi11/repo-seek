
import fs from "fs";
import rlPromises from "readline/promises";
import path from "path";
import { fileURLToPath } from "url";
    
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OPTIONS = {
    "topic": {
        type: "array",
        describe: "Filters in repositories with the specified topic(s)",
    },
    "language": {
        type: "array",
        describe: "Filters in repositories with the specified language(s)"
    },
    "stars-min": {
        type: "number",
        describe: "Filters out repositories less than the specified minimum",
        requiresArg: true
    },
    "stars-max": {
        type: "number",
        describe: "Filters out repositories greater than the specified maximum",
        requiresArg: true
    },
    "created-before": {
        type: "string",
        describe: "Filters out repositories after the specified date",
        requiresArg: true
    },
    "created-after": {
        type: "string",
        describe: "Filters out repositories before the specified date",
        requiresArg: true
    },
    "sort": {
        type: "string",
        describe: "Sorts resulting repositories based on the specified attribute",
        choices: ["stars", "forks", "help-wanted-issues", "updated"],
        requiresArg: true
    },
    "order": {
        type: "string",
        describe: "Applies sorting in the specified order",
        choices: ["desc", "asc"],
        requiresArg: true
    },
    "limit": {
        type: "number",
        describe: "Sets an upper limit for the number of results (max 500)",
        default: 30,
        requiresArg: true
    },
    "output-format": {
        type: "string",
        describe: "Outputs results in the specified format",
        default: "stdout",
        choices: ["stdout", "json", "csv"],
        requiresArg: true
    },
    "output-name": {
        type: "string",
        describe: "Outputs results into the specified file (only if output-format is not stdout) - default name is repo-seek-results",
        requiresArg: true
    },
    "force": {
        type: "boolean",
        describe: "Toggles forced execution, without any prompts",
        default: false,
    },
};

async function confirmOverwrite(file) {
    const rl = rlPromises.createInterface({ input: process.stdin, output: process.stdout });

    let answer = await rl.question(`Are you sure you want to overwrite '${file}' (Y/n)? `);
    rl.close();

    answer = answer.trim().toLowerCase();
    if (["n", "no"].includes(answer)) return false;
    return true;
}

async function validateArguments(option, args, argv) {
    switch (option) {
        case "created-before":
        case "created-after":
            const valid = /^\d{4}-\d{2}-\d{2}$/.test(args);
            if (!valid) throw new Error(`'${option}' must have a format of YYYY-MM-DD.`)
            break;
        case "limit":
            if (args > 500) throw new Error(`'limit' cannot be greater than 500.`);
            break;
        case "output-format":
            if (args !== "stdout" && !Object.keys(argv).includes("output-name")) {
                await validateArguments("output-name", `repo-seek-results.${argv['output-format']}`, argv);
                argv['output-name'] = `repo-seek-results.${argv['output-format']}`;
            };
            break;
        case "output-name":
            if (argv['output-format'] === "stdout")
                throw new Error('Cannot set output name when output format is stdout.');

            const filepath = path.join(__dirname, "..", `${args}`);
            if (fs.existsSync(filepath) && !argv['force']) {
                const confirmed = await confirmOverwrite(filepath);
                if (!confirmed) {
                    console.log("Terminating... No requests sent.");
                    process.exit(1);
                }
            }
            break;
    }
}

export default {
    validateArguments, 
    OPTIONS,
    __dirname
};