# repo-seek

This tool provides a CLI interface for repository search, using the Github Search API.

This project aims to provide a convenient, intuitive interface to the vast sea of GitHub repositories, helping inspire and motivate all types of developers.

This project extends the functionalities that Github already provides, allowing:
- Exporting to different output formats
- Removal of clutter by default (use --raw flag to re-include it)

The npm package can be found at [https://www.npmjs.com/package/repo-seek](https://www.npmjs.com/package/repo-seek)

## Notes

- Many of the restrictions imposed by this tool are due to limits imposed by the GitHub Search API
- Search will not check for exact matches, but only looks for instances including the search terms (similarly to GitHub).
- No more than 6 instances of query types (i.e. topic, language, stars, created) can be used in a single query, due to restrictions imposed by the GitHub Search API. Examples of invalid queries are '--topic a b c d e f g' and '--language c java --topic game crypto ssh --stars-min 100 --created-before 2024-01-01'
- When using "stdout" as the output method, a maximum of 50 results will be displayed to prevent flooding in the terminal. If you need more than 50 results, use "json" or "csv" as the output method.
- Inputting extremely large numbers (>) into numerical types (e.g. limit) can lead to unpredictable results.

## Installation

This is a Node-based tool that is published on NPM. Therefore, you must have Node (>=20.10.0) and npm installed beforehand.

To install repo-seek globally, run `npm install -g repo-seek`.

## Features

To find more about features, use `repo-seek -h`. Alternatively, you can view the full specification at 'utils/options/options.js'.

Users can search repositories based on:

- Topic:
  - Takes in multiple arguments
  - Arguments can be anything

- Language:
  - Takes in multiple arguments
  - Arguments can be anything

- Stars:
  - Takes in a single argument
  - Arguments must follow the Github syntax rules

- Creation date: (inclusive)
  - Takes in a single argument
  - Arguments must follow the Github syntax rules, and the date must be formatted correctly

- Sorting;
  - Takes in a single argument
  - Argument must be in a specified set (stars, forks, help-wanted-issue or updated)
  - Default: best match (combination of different factors computed internally by GitHub)

- Order:
  - Takes in a single argument
  - Argument must be in a specified set (desc, asc)
  - Cannot be set if sort is not specified
  - Default: desc

- Limit:
  - Takes in a single argument
  - Argument must be less than or equal to 500
  - Default: 30

- Output Format:
  - Takes in a single argument
  - Argument must be in a specified set (stdout, json, csv)
  - Default: stdout

- Output File Name:
  - Takes in a single argument
  - Argument can be anything
  - Ask for confirmation: if the file already exists, in which case overwrite
  - Source of error: Output file can only be specified when output format is json or csv, not stdout
  - Note: file extension (json, csv) will be automatically added

- Force:
  - Takes no arguments (boolean type)
  - Enables forced execution, without any prompts

- Raw:
  - Takes no arguments (boolean type)
  - Enables return of raw response data, for more repo details

## Testing

This project includes some unit testing of the core option processing functionality, using Jest to evaluate test cases and mocking. These tests can be found in 'tests/processArguments.test.js'. Other functionality was tested informally.

## Resources

Node, GitHub Search API, yargs (option argument processing), biome (linting), 'json-2-csv' (for csv output), Jest (for testing)

## Extending the project

- Additional options for filtering repos can be implemented, such as search term, organisation, license, and visibility
- Personal Access Token authentication would allow users to perform more complex queries before the rate limit is hit (see Github API docs)
- More testing can be done
