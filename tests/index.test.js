import {
    processArguments,
    processRequests,
    sendRequests,
    displayResults,
    main
} from "../index.js";


describe("Argument parsing", () => {

    const originalArgv = [...process.argv];

    afterEach(() => {
        process.argv = originalArgv;
    })

    test("empty search query", async () => {
        process.argv = ["node", "index.js"]
        await expect(processArguments()).rejects.toThrow("Search query cannot be empty");
    })
})
