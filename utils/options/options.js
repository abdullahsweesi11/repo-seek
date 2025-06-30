import validateOptions from "./validateOptions.js";

const OPTIONS = {
	topic: {
		string: true, // 'topic' is an array of strings
		type: "array",
		describe: "Filters in repositories with the specified topic(s)",
	},
	language: {
		string: true, // 'language' is an array of strings
		type: "array",
		describe: "Filters in repositories with the specified language(s)",
	},
	"stars-min": {
		type: "number",
		describe: "Filters out repositories less than the specified minimum",
		requiresArg: true,
	},
	"stars-max": {
		type: "number",
		describe: "Filters out repositories greater than the specified maximum",
		requiresArg: true,
	},
	"created-before": {
		type: "string",
		describe: "Filters out repositories after the specified date",
		requiresArg: true,
	},
	"created-after": {
		type: "string",
		describe: "Filters out repositories before the specified date",
		requiresArg: true,
	},
	sort: {
		type: "string",
		describe: "Sorts resulting repositories based on the specified attribute",
		choices: ["stars", "forks", "help-wanted-issues", "updated"],
		requiresArg: true,
	},
	order: {
		type: "string",
		describe: "Applies sorting in the specified order",
		choices: ["desc", "asc"],
		requiresArg: true,
	},
	limit: {
		type: "number",
		describe: "Sets an upper limit for the number of results (max 500)",
		default: 30,
		requiresArg: true,
	},
	"output-format": {
		type: "string",
		describe: "Outputs results in the specified format",
		default: "stdout",
		choices: ["stdout", "json", "csv"],
		requiresArg: true,
	},
	"output-name": {
		type: "string",
		describe:
			"Outputs results into the specified file - default name is repo-seek-results",
		requiresArg: true,
	},
	force: {
		type: "boolean",
		describe: "Enables forced execution, without any prompts",
		default: false,
	},
	raw: {
		type: "boolean",
		describe: "Enables return of raw response data, for more repo details",
		default: false,
	},
};

async function validateArguments(argv, _) {
	// check that query is not empty
	validateOptions.validateEmptyQuery(argv);

	// check that there are no more than 6 query components (per GitHub API rules)
	validateOptions.validateQueryComponents(argv);

	// check that no strings were passed for any numeric type
	validateOptions.validateNumericTypes(argv);

	// perform some checks for limit
	validateOptions.validateLimit(argv);

	// perform some checks for stars-min and stars-max
	validateOptions.validateStars(argv);

	// perform some checks for created-before and created-after
	validateOptions.validateCreated(argv);

	validateOptions.validateOrder(argv);

	// perform some checks for output-name
	await validateOptions.validateOutputName(argv);

	// perform some checks for output-format
	await validateOptions.validateOutputFormat(argv);

	return true;
}

export default {
	validateArguments,
	OPTIONS,
};
