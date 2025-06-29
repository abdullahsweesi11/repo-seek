import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import confirmOverwrite from "./confirmOverwrite.js";

export const STDOUT_LIMIT = 50;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function validateEmptyQuery(argv) {
    const nonEmptyQuery = ["topic", "language", "stars-min", "stars-max", "created-before", "created-after"]
                            .map(v => v in argv)
                            .some(v => v)

    if (!nonEmptyQuery)
        throw new Error(
            "Search query cannot be empty (add query-specific options)" 
        );
}


function validateQueryComponents(argv) {
    const queryComponents = {
        topic: 0,
        language: 0,
        stars: 0,
        created: 0,
    };

    for (const [key, value] of Object.entries(argv)) {
        if (key === "topic" || key === "language")
            queryComponents[key] += value.length;
        if (key.startsWith("stars") || key.startsWith("created")) {
            const prefix = key.startsWith("stars") ? "stars" : "created";
            queryComponents[prefix] = Math.min(1 + queryComponents[prefix], 1);
        }
    }

    if (Object.values(queryComponents).reduce((acc, val) => acc + val) > 6)
        throw new Error(
            `Query exceeds maximum of 6 components (i.e. topic, language, stars, created). See documentation for details.`,
        );
}


function validateNumericTypes(argv) {
    ["limit", "stars-min", "stars-max"].forEach(v => {
        if (v in argv && Number.isNaN(argv[v]))
            throw new Error(`--${v} must be a number.`)
    })
}


function validateLimit(argv) {
    if (argv.limit <= 0 || argv.limit > 500)
        throw new Error(
            "The provided limit is not within the allowed range (1-500).",
        );

    if (
        argv.limit > STDOUT_LIMIT &&
        argv["output-format"] === "stdout"
    ) {
        console.warn(
            `Warning: Limit capped at ${STDOUT_LIMIT} to prevent terminal flooding. Use JSON or CSV for more results.\n`,
        );
        argv.limit = STDOUT_LIMIT;
    }
}


function validateStars(argv) {
    const starsMinPresent = "stars-min" in argv;
    const starsMaxPresent = "stars-max" in argv;

    if (starsMinPresent && argv["stars-min"] < 0)
        throw new Error(
            "--stars-min cannot be negative."
        );
    
    if (starsMaxPresent && argv["stars-max"] < 0)
        throw new Error(
            "--stars-max cannot be negative."
        );
    
    if (starsMinPresent && starsMaxPresent && argv['stars-min'] > argv['stars-max'])
        throw new Error(
            "--stars-min cannot be greater than --stars-max"
        );
}


function isValidDate(date) {
    const components = date.split("-").map(v => parseInt(v));

    if (components.length !== 3) return false;

    const generatedDate = new Date(components[0], components[1] - 1, components[2]);
    if (generatedDate.getUTCFullYear() !== components[0] ||
        generatedDate.getUTCMonth() + 1 !== components[1] ||
        generatedDate.getUTCDate() !== components[2]) 
        return false;
    
    return true;
}


function validateCreated(argv) {
    const createdBeforePresent = "created-before" in argv;
    const createdAfterPresent = "created-after" in argv;

    if (createdBeforePresent) {
        const valid = /^\d{4}-\d{2}-\d{2}$/.test(argv["created-before"]);
        if (!valid)
            throw new Error("--created-before must have a format of YYYY-MM-DD.");
    }

    if (createdAfterPresent) {
        const valid = /^\d{4}-\d{2}-\d{2}$/.test(argv["created-after"]);
        if (!valid)
            throw new Error("--created-after must have a format of YYYY-MM-DD.");
    }

    if (createdBeforePresent && createdAfterPresent && 
        (new Date(argv["created-before"])) < (new Date(argv["created-after"])))
        throw new Error("--created-before must be after --created-after")
    
    if (createdBeforePresent && !isValidDate(argv["created-before"]))
        throw new Error("--created-before is an invalid date")

    if (createdAfterPresent && 
        (!isValidDate(argv["created-after"]) || (new Date(argv["created-after"])) > (new Date())))
        throw new Error("--created-after is an invalid date")


}


function validateOrder(argv) {
    if ("order" in argv && !("sort" in argv))
        throw new Error(
            "Order cannot be configured unless sorting criteria is specified.",
        );
}


async function validateOutputName(argv) {
    if (!("output-name" in argv))
        return;

    if (argv["output-format"] === "stdout")
        throw new Error("Cannot set output name when output format is stdout.");

    const filepath = path.join(__dirname, "..", "..", `${argv['output-name']}`);
    if (fs.existsSync(filepath) && !argv.force) {
        const confirmed = await confirmOverwrite(filepath);
        if (!confirmed) {
            console.log("Terminating... No requests sent.");
            process.exit(1);
        }
    }
}


async function validateOutputFormat(argv) {
    if (argv['output-format'] !== "stdout" && !("output-name" in argv)) {
        argv["output-name"] = `repo-seek-results.${argv["output-format"]}`;
        await validateOutputName(argv);
    }
}


export default {
    validateEmptyQuery,
    validateQueryComponents,
    validateNumericTypes,
    validateLimit,
    validateStars,
    validateCreated,
    validateOrder,
    validateOutputName,
    validateOutputFormat
}