import validateOptions from "./validateOptions.js";

const OPTIONS = {
	topic: {
		string: true,
		type: "array",
		describe: "Filter in repositories with the desired topic(s)",
	},
	language: {
		string: true,
		type: "array",
		describe: "Filter in repositories with the desired language(s)",
	},
	"stars-min": {
		type: "number",
		describe: "Filter in repositories with n stars or more",
		requiresArg: true,
	},
	"stars-max": {
		type: "number",
		describe: "Filter in repositories with n stars or less",
		requiresArg: true,
	},
	"created-after": {
		type: "string",
		describe: "Filter in repositories created on or after a specific date",
		requiresArg: true,
	},
	"created-before": {
		type: "string",
		describe: "Filter in repositories created on or before a specific date",
		requiresArg: true,
	},
	sort: {
		type: "string",
		describe: "Sort repositories based on some criteria",
		choices: ["stars", "forks", "help-wanted-issues", "updated"],
		requiresArg: true,
	},
	order: {
		type: "string",
		describe: "Apply sorting in some order",
		choices: ["desc", "asc"],
		requiresArg: true,
	},
	limit: {
		type: "number",
		describe: "Set an upper limit for the result count (1-500)",
		default: 30,
		requiresArg: true,
	},
	"output-format": {
		type: "string",
		describe: "Output the result in some format",
		default: "stdout",
		choices: ["stdout", "json", "csv"],
		requiresArg: true,
	},
	"output-name": {
		type: "string",
		describe:
			"Output the result into a file with some name (default: repo-seek-results)",
		requiresArg: true,
	},
	force: {
		type: "boolean",
		describe: "Enable forced execution without any prompts",
		default: false,
	},
	raw: {
		type: "boolean",
		describe: "Enable raw response data for more detailed information",
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
