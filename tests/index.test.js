import {
    processArguments,
    processRequests,
    sendRequests,
    displayResults,
    main
} from "../index.js";


describe("Argument parsing", () => {

    const originalArgv = [...process.argv];

    const emptyQueryMessage = "Search query cannot be empty (add query-specific options)";
    const queryLimitHitMessage = `Query exceeds maximum of 6 components (i.e. topic, language, stars, created). See documentation for details.`;

    afterEach(() => {
        process.argv = originalArgv;
    })

    // EMPTY QUERY

    describe("Empty Query", () => {
        test("empty search query", async () => {
            process.argv = ["node", "index.js"]
            await expect(processArguments()).rejects.toThrow(emptyQueryMessage);
        })
    
        test("empty search query with multiple non-positional arguments", async () => {
            process.argv = ["node", "index.js", "a", "b", "c", 1, 2]
            await expect(processArguments()).rejects.toThrow(emptyQueryMessage)
        })
    })

    // TODO: For each argument, test different values and shapes
    // After each argument is tested separately, mix some arguments together

    // TOPIC

    describe("--topic arguments", () => {
        const basicArgv = {
            '$0': 'index.js',
            force: false,
            'output-format': 'stdout',
            limit: 30,
        }

        test("empty string argument for topic", async () => {
            process.argv = ["node", "index.js", "--topic", ""]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: [""]
            }))
        })
    
        test("one 1-letter alphabetical string argument for topic", async () => {
            process.argv = ["node", "index.js", "--topic", "a"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["a"]
            }))
        })
    
        test("one simple numerical argument for topic", async () => {
            process.argv = ["node", "index.js", "--topic", -1234]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["-1234"]
            }))

            process.argv = ["node", "index.js", "--topic", 0]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["0"]
            }))

            process.argv = ["node", "index.js", "--topic", 1]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["1"]
            }))
    
            process.argv = ["node", "index.js", "--topic", 987]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["987"]
            }))
        })
    
        test("one complex numerical argument for topic", async () => {
            process.argv = ["node", "index.js", "--topic", 1234567890]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["1234567890"]
            }))
    
            process.argv = ["node", "index.js", "--topic", Number.MAX_SAFE_INTEGER]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: [`${Number.MAX_SAFE_INTEGER}`]
            }))
    
            process.argv = ["node", "index.js", "--topic", Number.MIN_SAFE_INTEGER]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: [`${Number.MIN_SAFE_INTEGER}`]
            }))
        })
    
        test("one multi-letter alphabetical string argument for topic", async () => {
            process.argv = ["node", "index.js", "--topic", "abcdefgh"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["abcdefgh"]
            }))
        })
    
        test("one multi-letter alphanumerical string argument for topic", async () => {
            process.argv = ["node", "index.js", "--topic", "a1b2c3d4efg567"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["a1b2c3d4efg567"]
            }))
        })
    
        test("one multi-letter arbitrary string argument for topic", async () => {
            process.argv = ["node", "index.js", "--topic", "grou3439;',./\!\"£$%^&*()\\|?><@:}{-=_+`¬"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["grou3439;',./\!\"£$%^&*()\\|?><@:}{-=_+`¬"]
            }))
        })
    
        test("multiple string arguments for topic, within limit", async () => {
            process.argv = ["node", "index.js", "--topic", "abc", "def"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["abc", "def"]
            }))
    
            process.argv = ["node", "index.js", "--topic", "abc", "def", "ghi"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["abc", "def", "ghi"]
            }))
    
            process.argv = ["node", "index.js", "--topic", "abc", "def", "ghi", "jkl"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["abc", "def", "ghi", "jkl"]
            }))
    
            process.argv = ["node", "index.js", "--topic", "abc", "def", "ghi", "jkl", "mno"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["abc", "def", "ghi", "jkl", "mno"]
            }))
    
            process.argv = ["node", "index.js", "--topic", "abc", "def", "ghi", "jkl", "mno", "pqr"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["abc", "def", "ghi", "jkl", "mno", "pqr"]
            }))
        })
    
        test("multiple numerical arguments for topic, within limit", async () => {
            process.argv = ["node", "index.js", "--topic", 1, 10]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["1", "10"]
            }))
    
            process.argv = ["node", "index.js", "--topic", 1, 10, 100]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["1", "10", "100"]
            }))
    
            process.argv = ["node", "index.js", "--topic", 1, 10, 100, 1000]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["1", "10", "100", "1000"]
            }))
    
            process.argv = ["node", "index.js", "--topic", 1, 10, 100, 1000, 10000]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["1", "10", "100", "1000", "10000"]
            }))
    
            process.argv = ["node", "index.js", "--topic", 1, 10, 100, 1000, 10000, 100000]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                topic: ["1", "10", "100", "1000", "10000", "100000"]
            }))
        })
    
        test("multiple string arguments for topic, beyond limit", async () => {
            process.argv = ["node", "index.js", "--topic", "abc", "def", "ghi", "jkl", "mno", "pqr", "stu"]
            await expect(processArguments()).rejects.toThrow(queryLimitHitMessage)
    
            process.argv = ["node", "index.js", "--topic", "abc", "def", "ghi", "jkl", "mno", "pqr", "stu", "vwx", "yz"]
            await expect(processArguments()).rejects.toThrow(queryLimitHitMessage)
        })
    
        test("multiple numerical arguments for topic, beyond limit", async () => {
            process.argv = ["node", "index.js", "--topic", 1, 10, 100, 1000, 10000, 100000, 1000000]
            await expect(processArguments()).rejects.toThrow(queryLimitHitMessage)
    
            process.argv = ["node", "index.js", "--topic", 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000]
            await expect(processArguments()).rejects.toThrow(queryLimitHitMessage)
        })
    })

    // LANGUAGE

    describe("--language arguments", () => {
        const basicArgv = {
            '$0': 'index.js',
            force: false,
            'output-format': 'stdout',
            limit: 30,
        }

        test("empty string argument for language", async () => {
            process.argv = ["node", "index.js", "--language", ""]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: [""]
            }))
        })
    
        test("one 1-letter alphabetical string argument for language", async () => {
            process.argv = ["node", "index.js", "--language", "a"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["a"]
            }))
        })
    
        test("one simple numerical argument for language", async () => {
            process.argv = ["node", "index.js", "--language", -1234]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["-1234"]
            }))

            process.argv = ["node", "index.js", "--language", 0]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["0"]
            }))

            process.argv = ["node", "index.js", "--language", 1]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["1"]
            }))
    
            process.argv = ["node", "index.js", "--language", 987]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["987"]
            }))
        })
    
        test("one complex numerical argument for language", async () => {
            process.argv = ["node", "index.js", "--language", 1234567890]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["1234567890"]
            }))
    
            process.argv = ["node", "index.js", "--language", Number.MAX_SAFE_INTEGER]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: [`${Number.MAX_SAFE_INTEGER}`]
            }))
    
            process.argv = ["node", "index.js", "--language", Number.MIN_SAFE_INTEGER]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: [`${Number.MIN_SAFE_INTEGER}`]
            }))
        })
    
        test("one multi-letter alphabetical string argument for language", async () => {
            process.argv = ["node", "index.js", "--language", "abcdefgh"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["abcdefgh"]
            }))
        })
    
        test("one multi-letter alphanumerical string argument for language", async () => {
            process.argv = ["node", "index.js", "--language", "a1b2c3d4efg567"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["a1b2c3d4efg567"]
            }))
        })
    
        test("one multi-letter arbitrary string argument for language", async () => {
            process.argv = ["node", "index.js", "--language", "grou3439;',./\!\"£$%^&*()\\|?><@:}{-=_+`¬"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["grou3439;',./\!\"£$%^&*()\\|?><@:}{-=_+`¬"]
            }))
        })
    
        test("multiple string arguments for language, within limit", async () => {
            process.argv = ["node", "index.js", "--language", "abc", "def"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["abc", "def"]
            }))
    
            process.argv = ["node", "index.js", "--language", "abc", "def", "ghi"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["abc", "def", "ghi"]
            }))
    
            process.argv = ["node", "index.js", "--language", "abc", "def", "ghi", "jkl"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["abc", "def", "ghi", "jkl"]
            }))
    
            process.argv = ["node", "index.js", "--language", "abc", "def", "ghi", "jkl", "mno"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["abc", "def", "ghi", "jkl", "mno"]
            }))
    
            process.argv = ["node", "index.js", "--language", "abc", "def", "ghi", "jkl", "mno", "pqr"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["abc", "def", "ghi", "jkl", "mno", "pqr"]
            }))
        })
    
        test("multiple numerical arguments for language, within limit", async () => {
            process.argv = ["node", "index.js", "--language", 1, 10]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["1", "10"]
            }))
    
            process.argv = ["node", "index.js", "--language", 1, 10, 100]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["1", "10", "100"]
            }))
    
            process.argv = ["node", "index.js", "--language", 1, 10, 100, 1000]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["1", "10", "100", "1000"]
            }))
    
            process.argv = ["node", "index.js", "--language", 1, 10, 100, 1000, 10000]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["1", "10", "100", "1000", "10000"]
            }))
    
            process.argv = ["node", "index.js", "--language", 1, 10, 100, 1000, 10000, 100000]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                ...basicArgv,
                language: ["1", "10", "100", "1000", "10000", "100000"]
            }))
        })
    
        test("multiple string arguments for language, beyond limit", async () => {
            process.argv = ["node", "index.js", "--language", "abc", "def", "ghi", "jkl", "mno", "pqr", "stu"]
            await expect(processArguments()).rejects.toThrow(queryLimitHitMessage)
    
            process.argv = ["node", "index.js", "--language", "abc", "def", "ghi", "jkl", "mno", "pqr", "stu", "vwx", "yz"]
            await expect(processArguments()).rejects.toThrow(queryLimitHitMessage)
        })
    
        test("multiple numerical arguments for language, beyond limit", async () => {
            process.argv = ["node", "index.js", "--topic", 1, 10, 100, 1000, 10000, 100000, 1000000]
            await expect(processArguments()).rejects.toThrow(queryLimitHitMessage)
    
            process.argv = ["node", "index.js", "--language", 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000]
            await expect(processArguments()).rejects.toThrow(queryLimitHitMessage)
        })
    })

    // STARS

    describe("--stars-min and --stars-max arguments", () => {
        const preset = ["node", "index.js", "--language", "javascript"]
        const basicArgv = {
            '$0': 'index.js',
            force: false,
            'output-format': 'stdout',
            limit: 30,
            language: ["javascript"]
        }

        test("normal execution", async () => {
            process.argv = [...preset, "--stars-min", 10]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                    ...basicArgv,
                    "stars-min": 10
                })
            )

            process.argv = [...preset, "--stars-max", 10]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                    ...basicArgv,
                    "stars-max": 10
                })
            )

            process.argv = [...preset, "--stars-min", 10, "--stars-max", 20]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                    ...basicArgv,
                    "stars-min": 10,
                    "stars-max": 20
                })
            )
        })

        test("string arguments", async () => {
            process.argv = [...preset, "--stars-min", "abc"]
            await expect(processArguments()).rejects.toThrow("--stars-min must be a number.")

            process.argv = [...preset, "--stars-max", "abc"]
            await expect(processArguments()).rejects.toThrow("--stars-max must be a number.")
        })

        test("negative arguments", async () => {
            process.argv = [...preset, "--stars-min", -123]
            await expect(processArguments()).rejects.toThrow("--stars-min cannot be negative.")

            process.argv = [...preset, "--stars-min", Number.MIN_SAFE_INTEGER]
            await expect(processArguments()).rejects.toThrow("--stars-min cannot be negative.")

            process.argv = [...preset, "--stars-max", -123]
            await expect(processArguments()).rejects.toThrow("--stars-max cannot be negative.")

            process.argv = [...preset, "--stars-max", Number.MIN_SAFE_INTEGER]
            await expect(processArguments()).rejects.toThrow("--stars-max cannot be negative.")
        })

        test("complex numerical argument", async () => {
            process.argv = [...preset, "--stars-min", Number.MAX_SAFE_INTEGER]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                    ...basicArgv,
                    "stars-min": Number.MAX_SAFE_INTEGER
                })
            )

            process.argv = [...preset, "--stars-max", Number.MAX_SAFE_INTEGER]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                    ...basicArgv,
                    "stars-max": Number.MAX_SAFE_INTEGER
                })
            )
        })

        test("--stars-min greater than --stars-max", async () => {
            process.argv = [...preset, "--stars-min", 20, "--stars-max", 10]
            await expect(processArguments()).rejects.toThrow("--stars-min cannot be greater than --stars-max")
        })
    })

    // CREATED

    describe("--created-before and --created-after arguments", () => {
        const preset = ["node", "index.js", "--language", "javascript"]
        const basicArgv = {
            '$0': 'index.js',
            force: false,
            'output-format': 'stdout',
            limit: 30,
            language: ["javascript"]
        }

        test("normal execution", async () => {
            process.argv = [...preset, "--created-before", "2024-01-01"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                    ...basicArgv,
                    "created-before": "2024-01-01"
                })
            )

            process.argv = [...preset, "--created-after", "2025-02-04"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                    ...basicArgv,
                    "created-after": "2025-02-04"
                })
            )

            process.argv = [...preset, "--created-before", "2025-02-04", "--created-after", "2024-01-01"]
            await expect(processArguments()).resolves.toEqual(
                expect.objectContaining({
                    ...basicArgv,
                    "created-before": "2025-02-04",
                    "created-after": "2024-01-01"
                })
            )
        })

        test("incorrect format", async () => {
            // (YYYY|YY)-(M|MM)-(D|DD) (e.g. 22-4-3)
            // MM-DD-YYYY or DD-MM-YYYY
            // YYYY/MM/DD
            // MM/DD/YYYY or DD/MM/YYYY
            // YYYYMMDD
        })

        test("invalid values", async () => {
            // DD is greater than 31, 31 in (e.g.) June, and >29 in February (also consider leap year)
            // MM is greater than 12
            // YYYY is after today for created-after
        })

        test("--created-before is before --created-after", async () => {
            // DD is greater than 31, 31 in (e.g.) June, and >29 in February (also consider leap year)
            // MM is greater than 12
        })
    })
})