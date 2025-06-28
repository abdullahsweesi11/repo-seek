# repo-seek

This tool will provide a CLI interface for interacting with the Github API ecosystem (which means that different API endpoints might be used for different inputs).

Important: the limits imposed by the GitHub API will need to be imposed by this service. Therefore: (list all restrictions at some point)
In the future, explain clearly the rules (e.g. max 6 query components for topic, language, stars, created).

Note: search will not check for exact matches, but only looks for instances including the search terms

Note: when using "stdout" as the output method, a maximum of 50 results will be displayed to prevent flooding in the terminal. If you need more than 50 results, use "json" or "csv" as the output method.

Note: inputting extremely large numbers (>) into numerical types can lead to undefined results.

To make this project worthwhile, it must extend the functionalities that Github already provides (in its website's search bar):
- Exporting to different output
- Remove urls by default, and ask users to use --include-urls flag, since urls clutter output

Users will potentially be able to search repositories based on:

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

- Output File:
  - Takes in a single argument
  - Argument can be anything
  - Ask for confirmation: if the file already exists, in which case overwrite
  - Source of error: Output file can only be specified when output format is json or csv, not pretty

- Force:
  - Takes no arguments
  - Does not provide any intermediary confirmation, executes directly

Options to add:
- Search term (most important)
- Organisation
- License
- Visbility

We'll have to think about rate limits, especially considering some queries may take up more tokens. Users may have the option to store a GitHub personal access token in an environment variable (or pass it in as an option) to increase the rate limit. Users might have an option so as to display the number of requests their input would take up (e.g. --dry-run), and how much requests they have left (e.g. --remaining-tokens/requests), as well as general stats (e.g. --stats).

We might choose to do some kind of testing.

Potentially useful tools:
- Clean UI: chalk (npm), ora (npm), cli-table3 (npm)
- CLI arguments: yargs (npm), commander (npm), meow (npm)