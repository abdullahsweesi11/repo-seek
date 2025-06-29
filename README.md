# repo-seek

This tool provides a CLI interface for repository search, using the Github Search API.

This project extends the functionalities that Github already provides, allowing:
- Exporting to different output formats
- Removal of urls by default to eliminate clutter, (use --include-urls flag to re-include it)

## Notes

- Many of the restrictions imposed by this tool are due to limits imposed by the GitHub Search API
- Search will not check for exact matches, but only looks for instances including the search terms (similarly to GitHub).
- No more than 6 instances of query types (i.e. topic, language, stars, created) can be used in a single query, due to restrictions imposed by the GitHub Search API. Examples of invalid queries are '--topic a b c d e f g' and '--language c java --topic game crypto ssh --stars-min 100 --created-before 2024-01-01'
- When using "stdout" as the output method, a maximum of 50 results will be displayed to prevent flooding in the terminal. If you need more than 50 results, use "json" or "csv" as the output method.
- Inputting extremely large numbers (>) into numerical types (e.g. limit) can lead to unpredictable results.

## Installation & Usage

(Coming soon..)

## Features

To find more about features, use `repo-seek -h`.

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
  - Takes no arguments
  - Does not provide any intermediary confirmation, executes directly

## Testing

This project includes some unit testing of the core option processing functionality, using Jest to evaluate test cases and mocking. These tests can be found in 'tests/processArguments.test.js'. Other functionality was tested informally.

## Extending the project

- Additional options for filtering repos can be implemented, such as search term, organisation, license, and visibility
- Personal Access Token authentication would allow users to perform more complex queries before the rate limit is hit (see Github API docs)
- More testing can be done