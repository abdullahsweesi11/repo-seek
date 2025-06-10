# repo-seek

This tool will provide a CLI interface for interacting with the Github API ecosystem (which means that different API endpoints might be used for different inputs).

Users will potentially be able to search repositories based on:
- Topic (filtering)
- Language (filtering)
- Number of stars (e.g. <50 or >100) - maybe --stars-lt and --stars-gt options
- Creation date (e.g. >2022-10-31) - maybe --before and --after options with automatic date parsing
- Limit (number of results)
- Sorting (e.g. based on stars, date updated, forks)
- JSON (i.e. should output be raw JSON?)


We'll have to think about rate limits, especially considering some queries may take up more tokens. Users may have the option to store a GitHub personal access token in an environment variable (or pass it in as an option) to increase the rate limit. Users might have an option so as to display the number of requests their input would take up (e.g. --dry-run), and how much requests they have left (e.g. --remaining-tokens/requests), as well as general stats (e.g. --stats).

We might choose to do some kind of testing.

Potentially useful tools:
- Clean UI: chalk (npm), ora (npm), cli-table3 (npm)
- CLI arguments: yargs (npm), commander (npm), meow (npm)