# repo-seek

This tool provides a CLI interface for repository search, using the Github Search API.

This project aims to provide a convenient, intuitive interface to the vast sea of GitHub repositories, helping inspire and motivate all types of developers.

This project extends the functionalities that Github already provides, allowing:
- Exporting to different output formats
- Removal of clutter by default (use --raw flag to re-include it)

The npm package can be found at [https://www.npmjs.com/package/repo-seek](https://www.npmjs.com/package/repo-seek)

## Installation

This is a Node-based tool that is published on NPM. Therefore, you must have Node (preferably >=20.10.0) and npm installed beforehand.

To install repo-seek globally, run `npm install -g repo-seek`.

## Options

To learn more about the available options, read the specification below - or alternatively, you can use `repo-seek --help` in the terminal.

Users can filter repositories using the following options:

- Topic:
  - Filter in repositories with the desired topic(s)
  - Option: --topic
  - Number of arguments: Multiple
  - Argument constraints: None

- Language:
  - Filter in repositories with the desired language(s)
  - Option: --language
  - Number of arguments: Multiple
  - Argument constraints: None 

- Minimum number of stars:
  - Filter in repositories with n stars or more
  - Option: --stars-min
  - Number of arguments: 1
  - Argument constraints: Must be a non-negative integer

- Maximum number of stars:
  - Filter in repositories with n stars or less
  - Option: --stars-max
  - Number of arguments: 1
  - Argument constraints: Must be a non-negative integer

- Earliest creation date:
  - Filter in repositories created on or after a specific date
  - Option: --created-after
  - Number of arguments: 1
  - Argument constraints: Must be in the format YYYY-MM-DD

- Latest creation date:
  - Filter in repositories created on or before a specific date
  - Option: --created-before
  - Number of arguments: 1
  - Argument constraints: Must be in the format YYYY-MM-DD

Additionally, users can adjust processing configurations using the following options:

- Sorting;
  - Sort repositories based on some criteria
  - Option: --sort
  - Number of arguments: 1
  - Argument constraints: Must be one of (stars, forks, help-wanted-issue,updated)
  - Default: best match _(combination of different factors computed internally by GitHub)_

- Order:
  - Apply sorting (see above) in some order
  - Option: --order
  - Number of arguments: 1
  - Argument constraints: Must be one of (desc, asc)
  - Note:
    - Cannot be set if --sort is not specified
  - Default: desc

- Limit:
  - Set an upper limit for the result count
  - Option: --limit
  - Number of arguments: 1
  - Argument constraints: Must be a non-negative integer between 1 and 500 (inclusive)
  - Note:
    - The limit may be capped if printing a lot of (50+) instances to STDOUT, to prevent flooding the terminal with data
  - Default: 30

- Output Format:
  - Output the result in some format
  - Option: --output-format
  - Number of arguments: 1
  - Argument constraints: Must be one of (stdout, json, csv)
  - Default: stdout

- Output File Name:
  - Output the result into a file with some name
  - Option: --output-name
  - Number of arguments: 1
  - Argument contraints: None
  - Note:
    - If the file already exists, the user will be asked to confirm a file overwrite
    - Output file name can only be specified when output format is json or csv, not stdout
    - File extension (i.e. json, csv) need not be included, as it is added automatically
  - Default: repo-seek-results

- Force:
  - Enable forced execution without any prompts
  - Option: --force
  - Number of arguments: 0
  - Argument constraints: N/A
  - Default: false

- Raw:
  - Enable raw response data for more detailed information
  - Option: --raw
  - Number of arguments: 0
  - Argument constraints: N/A
  - Default: false

## Testing

This project includes some unit testing of the core option processing functionality, using Jest to evaluate test cases and mocking. These tests can be found in 'tests/processArguments.test.js'. Other functionality was validated through ad-hoc testing.

## Notes

- Many of the restrictions imposed by this tool are due to limits imposed by the GitHub Search API
- Search will not check for exact matches, but only looks for instances including the search terms (similarly to GitHub).
- No more than 6 instances of query types (i.e. topic, language, star count, creation date) can be used in a single query, due to restrictions imposed by the GitHub Search API. Examples of invalid queries are '--topic a b c d e f g' and '--language c java --topic game crypto ssh --stars-min 100 --created-before 2024-01-01'
- Inputting extremely large numbers into numerical types (e.g. limit) may lead to unpredictable results.

## Resources

Node.js, GitHub Search API, yargs (option argument processing), biome (linting), 'json-2-csv' (for csv output), Jest (for testing)

## Extending the project

- Additional options for filtering repos can be implemented, such as search term, organisation, license, and visibility
- Personal Access Token authentication would allow users to perform more complex queries before the rate limit is hit (see Github API docs)
- More testing can be done

## Communication

You can email me at abdullahmsweesi@gmail.com for any enquiries you may have.