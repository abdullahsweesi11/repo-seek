
// TODO: Design the specification of available options and their metadata

// Topic:
// - Takes in multiple arguments
// - Arguments can be anything

// Language:
// - Takes in multiple arguments
// - Arguments can be anything

// Stars:
// - Takes in a single argument
// - Arguments must follow the Github syntax rules

// Creation date:
// - Takes in a single argument
// - Arguments must follow the Github syntax rules, and the date must be formatted correctly

// Sorting;
// - Takes in a single argument
// - Argument must be in a specified set (stars, forks, help-wanted-issue or updated)
// - Default: best match (combination of different factors computed internally by GitHub)

// Order:
// - Takes in a single argument
// - Argument must be in a specified set (desc, asc)
// - Default: desc

// Limit:
// - Takes in a single argument
// - Argument must be a number less than or equal to 500
// - Default: 100

// Output Format:
// - Takes in a single argument
// - Argument must be in a specified set (pretty, json, csv)
// - Default: pretty

// Output File:
// - Takes in a single argument
// - Argument can be anything
// - Ask for confirmation: if the file already exists, in which case overwrite
// - Source of error: Output file can only be specified when output format is json or csv, not pretty

// Force:
// - Takes no arguments
// - Does not provide any intermediary confirmation, executes directly