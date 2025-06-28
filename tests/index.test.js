import {
    processArguments,
    processRequests,
    sendRequests,
    displayResults,
    main
} from "../index.js";


describe("Argument parsing", () => {

    const originalArgv = [...process.argv];
    const basicArgv = {
        '$0': 'index.js',
        force: false,
        'output-format': 'stdout',
        limit: 30,
    }

    const emptyQueryMessage = "Search query cannot be empty (add query-specific options)";
    const queryLimitHitMessage = `Query exceeds maximum of 6 components (i.e. topic, language, stars, created). See documentation for details.`;

    afterEach(() => {
        process.argv = originalArgv;
    })

    test("empty search query", async () => {
        process.argv = ["node", "index.js"]
        await expect(processArguments()).rejects.toThrow(emptyQueryMessage);
    })

    test("empty search query with multiple non-positional arguments", async () => {
        process.argv = ["node", "index.js", "a", "b", "c", 1, 2]
        await expect(processArguments()).rejects.toThrow(emptyQueryMessage)
    })

    // TODO: For each argument, test different values and shapes
    // After each argument is tested separately, mix some arguments together

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