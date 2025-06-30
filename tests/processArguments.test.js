import path from "node:path";
import { fileURLToPath } from "node:url";
import { jest } from "@jest/globals";

global.confirmOverwriteCalled = false;

jest.unstable_mockModule("../utils/options/confirmOverwrite.js", async () => {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));

	return {
		getFilePath: jest.fn((filename) => path.join(__dirname, `${filename}`)),
		default: jest.fn(async () => {
			global.confirmOverwriteCalled = true;
			return Promise.resolve(true);
		}),
	};
});

const { STDOUT_LIMIT } = await import("../utils/options/validateOptions.js");

const { processArguments } = await import("../index.mjs");

describe("Argument parsing", () => {
	const originalArgv = [...process.argv];

	afterEach(() => {
		process.argv = originalArgv;
		global.confirmOverwriteCalled = false;
	});

	// EMPTY QUERY

	describe("Empty Query", () => {
		const emptyQueryMessage =
			"Search query cannot be empty (add query-specific options)";

		test("empty search query", async () => {
			process.argv = ["node", "index.js"];
			await expect(processArguments()).rejects.toThrow(emptyQueryMessage);
		});

		test("empty search query with multiple non-positional arguments", async () => {
			process.argv = ["node", "index.js", "a", "b", "c", 1, 2];
			await expect(processArguments()).rejects.toThrow(emptyQueryMessage);
		});
	});

	// TODO: For each argument, test different values and shapes
	// After each argument is tested separately, mix some arguments together

	// TOPIC

	describe("--topic arguments", () => {
		const basicArgv = {
			$0: "index.js",
			force: false,
			"output-format": "stdout",
			limit: 30,
		};

		const queryLimitHitMessage = `Query exceeds maximum of 6 components (i.e. topic, language, stars, created). See documentation for details.`;

		test("empty string argument for topic", async () => {
			process.argv = ["node", "index.js", "--topic", ""];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: [""],
				}),
			);
		});

		test("one 1-letter alphabetical string argument for topic", async () => {
			process.argv = ["node", "index.js", "--topic", "a"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["a"],
				}),
			);
		});

		test("one simple numerical argument for topic", async () => {
			process.argv = ["node", "index.js", "--topic", -1234];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["-1234"],
				}),
			);

			process.argv = ["node", "index.js", "--topic", 0];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["0"],
				}),
			);

			process.argv = ["node", "index.js", "--topic", 1];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["1"],
				}),
			);

			process.argv = ["node", "index.js", "--topic", 987];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["987"],
				}),
			);
		});

		test("one complex numerical argument for topic", async () => {
			process.argv = ["node", "index.js", "--topic", 1234567890];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["1234567890"],
				}),
			);

			process.argv = ["node", "index.js", "--topic", Number.MAX_SAFE_INTEGER];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: [`${Number.MAX_SAFE_INTEGER}`],
				}),
			);

			process.argv = ["node", "index.js", "--topic", Number.MIN_SAFE_INTEGER];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: [`${Number.MIN_SAFE_INTEGER}`],
				}),
			);
		});

		test("one multi-letter alphabetical string argument for topic", async () => {
			process.argv = ["node", "index.js", "--topic", "abcdefgh"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["abcdefgh"],
				}),
			);
		});

		test("one multi-letter alphanumerical string argument for topic", async () => {
			process.argv = ["node", "index.js", "--topic", "a1b2c3d4efg567"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["a1b2c3d4efg567"],
				}),
			);
		});

		test("one multi-letter arbitrary string argument for topic", async () => {
			process.argv = [
				"node",
				"index.js",
				"--topic",
				"grou3439;',./\!\"£$%^&*()\\|?><@:}{-=_+`¬",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["grou3439;',./\!\"£$%^&*()\\|?><@:}{-=_+`¬"],
				}),
			);
		});

		test("multiple string arguments for topic, within limit", async () => {
			process.argv = ["node", "index.js", "--topic", "abc", "def"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["abc", "def"],
				}),
			);

			process.argv = ["node", "index.js", "--topic", "abc", "def", "ghi"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["abc", "def", "ghi"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--topic",
				"abc",
				"def",
				"ghi",
				"jkl",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["abc", "def", "ghi", "jkl"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--topic",
				"abc",
				"def",
				"ghi",
				"jkl",
				"mno",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["abc", "def", "ghi", "jkl", "mno"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--topic",
				"abc",
				"def",
				"ghi",
				"jkl",
				"mno",
				"pqr",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["abc", "def", "ghi", "jkl", "mno", "pqr"],
				}),
			);
		});

		test("multiple numerical arguments for topic, within limit", async () => {
			process.argv = ["node", "index.js", "--topic", 1, 10];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["1", "10"],
				}),
			);

			process.argv = ["node", "index.js", "--topic", 1, 10, 100];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["1", "10", "100"],
				}),
			);

			process.argv = ["node", "index.js", "--topic", 1, 10, 100, 1000];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["1", "10", "100", "1000"],
				}),
			);

			process.argv = ["node", "index.js", "--topic", 1, 10, 100, 1000, 10000];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["1", "10", "100", "1000", "10000"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--topic",
				1,
				10,
				100,
				1000,
				10000,
				100000,
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					topic: ["1", "10", "100", "1000", "10000", "100000"],
				}),
			);
		});

		test("multiple string arguments for topic, beyond limit", async () => {
			process.argv = [
				"node",
				"index.js",
				"--topic",
				"abc",
				"def",
				"ghi",
				"jkl",
				"mno",
				"pqr",
				"stu",
			];
			await expect(processArguments()).rejects.toThrow(queryLimitHitMessage);

			process.argv = [
				"node",
				"index.js",
				"--topic",
				"abc",
				"def",
				"ghi",
				"jkl",
				"mno",
				"pqr",
				"stu",
				"vwx",
				"yz",
			];
			await expect(processArguments()).rejects.toThrow(queryLimitHitMessage);
		});

		test("multiple numerical arguments for topic, beyond limit", async () => {
			process.argv = [
				"node",
				"index.js",
				"--topic",
				1,
				10,
				100,
				1000,
				10000,
				100000,
				1000000,
			];
			await expect(processArguments()).rejects.toThrow(queryLimitHitMessage);

			process.argv = [
				"node",
				"index.js",
				"--topic",
				1,
				10,
				100,
				1000,
				10000,
				100000,
				1000000,
				10000000,
				100000000,
			];
			await expect(processArguments()).rejects.toThrow(queryLimitHitMessage);
		});
	});

	// LANGUAGE

	describe("--language arguments", () => {
		const basicArgv = {
			$0: "index.js",
			force: false,
			"output-format": "stdout",
			limit: 30,
		};

		const queryLimitHitMessage = `Query exceeds maximum of 6 components (i.e. topic, language, stars, created). See documentation for details.`;

		test("empty string argument for language", async () => {
			process.argv = ["node", "index.js", "--language", ""];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: [""],
				}),
			);
		});

		test("one 1-letter alphabetical string argument for language", async () => {
			process.argv = ["node", "index.js", "--language", "a"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["a"],
				}),
			);
		});

		test("one simple numerical argument for language", async () => {
			process.argv = ["node", "index.js", "--language", -1234];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["-1234"],
				}),
			);

			process.argv = ["node", "index.js", "--language", 0];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["0"],
				}),
			);

			process.argv = ["node", "index.js", "--language", 1];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["1"],
				}),
			);

			process.argv = ["node", "index.js", "--language", 987];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["987"],
				}),
			);
		});

		test("one complex numerical argument for language", async () => {
			process.argv = ["node", "index.js", "--language", 1234567890];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["1234567890"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--language",
				Number.MAX_SAFE_INTEGER,
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: [`${Number.MAX_SAFE_INTEGER}`],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--language",
				Number.MIN_SAFE_INTEGER,
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: [`${Number.MIN_SAFE_INTEGER}`],
				}),
			);
		});

		test("one multi-letter alphabetical string argument for language", async () => {
			process.argv = ["node", "index.js", "--language", "abcdefgh"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["abcdefgh"],
				}),
			);
		});

		test("one multi-letter alphanumerical string argument for language", async () => {
			process.argv = ["node", "index.js", "--language", "a1b2c3d4efg567"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["a1b2c3d4efg567"],
				}),
			);
		});

		test("one multi-letter arbitrary string argument for language", async () => {
			process.argv = [
				"node",
				"index.js",
				"--language",
				"grou3439;',./\!\"£$%^&*()\\|?><@:}{-=_+`¬",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["grou3439;',./\!\"£$%^&*()\\|?><@:}{-=_+`¬"],
				}),
			);
		});

		test("multiple string arguments for language, within limit", async () => {
			process.argv = ["node", "index.js", "--language", "abc", "def"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["abc", "def"],
				}),
			);

			process.argv = ["node", "index.js", "--language", "abc", "def", "ghi"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["abc", "def", "ghi"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--language",
				"abc",
				"def",
				"ghi",
				"jkl",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["abc", "def", "ghi", "jkl"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--language",
				"abc",
				"def",
				"ghi",
				"jkl",
				"mno",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["abc", "def", "ghi", "jkl", "mno"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--language",
				"abc",
				"def",
				"ghi",
				"jkl",
				"mno",
				"pqr",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["abc", "def", "ghi", "jkl", "mno", "pqr"],
				}),
			);
		});

		test("multiple numerical arguments for language, within limit", async () => {
			process.argv = ["node", "index.js", "--language", 1, 10];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["1", "10"],
				}),
			);

			process.argv = ["node", "index.js", "--language", 1, 10, 100];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["1", "10", "100"],
				}),
			);

			process.argv = ["node", "index.js", "--language", 1, 10, 100, 1000];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["1", "10", "100", "1000"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--language",
				1,
				10,
				100,
				1000,
				10000,
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["1", "10", "100", "1000", "10000"],
				}),
			);

			process.argv = [
				"node",
				"index.js",
				"--language",
				1,
				10,
				100,
				1000,
				10000,
				100000,
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					language: ["1", "10", "100", "1000", "10000", "100000"],
				}),
			);
		});

		test("multiple string arguments for language, beyond limit", async () => {
			process.argv = [
				"node",
				"index.js",
				"--language",
				"abc",
				"def",
				"ghi",
				"jkl",
				"mno",
				"pqr",
				"stu",
			];
			await expect(processArguments()).rejects.toThrow(queryLimitHitMessage);

			process.argv = [
				"node",
				"index.js",
				"--language",
				"abc",
				"def",
				"ghi",
				"jkl",
				"mno",
				"pqr",
				"stu",
				"vwx",
				"yz",
			];
			await expect(processArguments()).rejects.toThrow(queryLimitHitMessage);
		});

		test("multiple numerical arguments for language, beyond limit", async () => {
			process.argv = [
				"node",
				"index.js",
				"--topic",
				1,
				10,
				100,
				1000,
				10000,
				100000,
				1000000,
			];
			await expect(processArguments()).rejects.toThrow(queryLimitHitMessage);

			process.argv = [
				"node",
				"index.js",
				"--language",
				1,
				10,
				100,
				1000,
				10000,
				100000,
				1000000,
				10000000,
				100000000,
			];
			await expect(processArguments()).rejects.toThrow(queryLimitHitMessage);
		});
	});

	// STARS

	describe("--stars-min and --stars-max arguments", () => {
		const preset = ["node", "index.js", "--language", "javascript"];
		const basicArgv = {
			$0: "index.js",
			force: false,
			"output-format": "stdout",
			limit: 30,
			language: ["javascript"],
		};

		test("normal execution", async () => {
			process.argv = [...preset, "--stars-min", 10];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"stars-min": 10,
				}),
			);

			process.argv = [...preset, "--stars-max", 10];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"stars-max": 10,
				}),
			);

			process.argv = [...preset, "--stars-min", 10, "--stars-max", 20];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"stars-min": 10,
					"stars-max": 20,
				}),
			);
		});

		test("string arguments", async () => {
			process.argv = [...preset, "--stars-min", "abc"];
			await expect(processArguments()).rejects.toThrow(
				"--stars-min must be a number.",
			);

			process.argv = [...preset, "--stars-max", "abc"];
			await expect(processArguments()).rejects.toThrow(
				"--stars-max must be a number.",
			);
		});

		test("negative arguments", async () => {
			process.argv = [...preset, "--stars-min", -123];
			await expect(processArguments()).rejects.toThrow(
				"--stars-min cannot be negative.",
			);

			process.argv = [...preset, "--stars-min", Number.MIN_SAFE_INTEGER];
			await expect(processArguments()).rejects.toThrow(
				"--stars-min cannot be negative.",
			);

			process.argv = [...preset, "--stars-max", -123];
			await expect(processArguments()).rejects.toThrow(
				"--stars-max cannot be negative.",
			);

			process.argv = [...preset, "--stars-max", Number.MIN_SAFE_INTEGER];
			await expect(processArguments()).rejects.toThrow(
				"--stars-max cannot be negative.",
			);
		});

		test("complex numerical argument", async () => {
			process.argv = [...preset, "--stars-min", Number.MAX_SAFE_INTEGER];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"stars-min": Number.MAX_SAFE_INTEGER,
				}),
			);

			process.argv = [...preset, "--stars-max", Number.MAX_SAFE_INTEGER];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"stars-max": Number.MAX_SAFE_INTEGER,
				}),
			);
		});

		test("--stars-min greater than --stars-max", async () => {
			process.argv = [...preset, "--stars-min", 20, "--stars-max", 10];
			await expect(processArguments()).rejects.toThrow(
				"--stars-min cannot be greater than --stars-max",
			);
		});
	});

	// CREATED

	describe("--created-before and --created-after arguments", () => {
		const preset = ["node", "index.js", "--language", "javascript"];
		const basicArgv = {
			$0: "index.js",
			force: false,
			"output-format": "stdout",
			limit: 30,
			language: ["javascript"],
		};

		const dateFormatMessage =
			"--created-before must have a format of YYYY-MM-DD.";
		const invalidDateMessage = "--created-before is an invalid date";

		test("normal execution", async () => {
			process.argv = [...preset, "--created-before", "2024-01-01"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"created-before": "2024-01-01",
				}),
			);

			process.argv = [...preset, "--created-before", "2024-02-29"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"created-before": "2024-02-29",
				}),
			);

			process.argv = [...preset, "--created-after", "2025-02-04"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"created-after": "2025-02-04",
				}),
			);

			process.argv = [
				...preset,
				"--created-before",
				"2025-02-04",
				"--created-after",
				"2024-01-01",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"created-before": "2025-02-04",
					"created-after": "2024-01-01",
				}),
			);
		});

		test("invalid format", async () => {
			process.argv = [...preset, "--created-before", "2024-1-1"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "2024-01-1"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "2024-1-01"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "24-1-1"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "01-01-2024"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "2024/01/01"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "2024/1/1"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "24/1/1"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "01/01/2024"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "1/1/2024"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "1/1/24"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);

			process.argv = [...preset, "--created-before", "20240101"];
			await expect(processArguments()).rejects.toThrow(dateFormatMessage);
		});

		test("invalid values", async () => {
			process.argv = [...preset, "--created-before", "2025-01-32"];
			await expect(processArguments()).rejects.toThrow(invalidDateMessage);

			process.argv = [...preset, "--created-before", "2025-02-29"];
			await expect(processArguments()).rejects.toThrow(invalidDateMessage);

			process.argv = [...preset, "--created-before", "2025-06-31"];
			await expect(processArguments()).rejects.toThrow(invalidDateMessage);

			process.argv = [...preset, "--created-before", "2024-13-01"];
			await expect(processArguments()).rejects.toThrow(invalidDateMessage);

			const currentDate = new Date();
			const afterToday = [
				`${currentDate.getUTCFullYear() + 1}`.padStart(4, "0"),
				`${currentDate.getUTCMonth()}`.padStart(2, "0"),
				`${currentDate.getUTCDate()}`.padStart(2, "0"),
			];
			process.argv = [...preset, "--created-before", afterToday.join("-")];
			await expect(processArguments()).rejects.toThrow(invalidDateMessage);
		});

		test("--created-before is before --created-after", async () => {
			process.argv = [
				...preset,
				"--created-after",
				"2025-01-01",
				"--created-before",
				"2024-01-01",
			];
			await expect(processArguments()).rejects.toThrow(
				"--created-before must be after --created-after",
			);
		});

		test("--created-before same as --created-after", async () => {
			process.argv = [
				...preset,
				"--created-after",
				"2025-01-01",
				"--created-before",
				"2025-01-01",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"created-before": "2025-01-01",
					"created-after": "2025-01-01",
				}),
			);
		});
	});

	// SORT + ORDER

	describe("--sort and --order arguments", () => {
		const preset = ["node", "index.js", "--language", "javascript"];
		const basicArgv = {
			$0: "index.js",
			force: false,
			"output-format": "stdout",
			limit: 30,
			language: ["javascript"],
		};

		test("normal execution", async () => {
			process.argv = [...preset, "--sort", "stars"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					sort: "stars",
				}),
			);

			process.argv = [...preset, "--sort", "forks"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					sort: "forks",
				}),
			);

			process.argv = [...preset, "--sort", "help-wanted-issues"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					sort: "help-wanted-issues",
				}),
			);

			process.argv = [...preset, "--sort", "updated"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					sort: "updated",
				}),
			);

			process.argv = [...preset, "--order", "desc", "--sort", "forks"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					sort: "forks",
					order: "desc",
				}),
			);

			process.argv = [...preset, "--order", "asc", "--sort", "updated"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					sort: "updated",
					order: "asc",
				}),
			);
		});

		test("invalid sort", async () => {
			process.argv = [...preset, "--sort", "abc"];
			await expect(processArguments()).rejects.toThrow(
				/^Invalid values:\n\s*Argument: sort, Given: "abc"/,
			);

			process.argv = [...preset, "--sort", 123];
			await expect(processArguments()).rejects.toThrow(
				/^Invalid values:\n\s*Argument: sort, Given: "123"/,
			);
		});

		test("invalid order", async () => {
			process.argv = [...preset, "--order", "abc"];
			await expect(processArguments()).rejects.toThrow(
				/^Invalid values:\n\s*Argument: order, Given: "abc"/,
			);

			process.argv = [...preset, "--order", 123];
			await expect(processArguments()).rejects.toThrow(
				/^Invalid values:\n\s*Argument: order, Given: "123"/,
			);
		});

		test("order without sort", async () => {
			process.argv = [...preset, "--order", "desc"];
			await expect(processArguments()).rejects.toThrow(
				"Order cannot be configured unless sorting criteria is specified.",
			);
		});
	});

	// LIMIT

	describe("--limit arguments", () => {
		const preset = ["node", "index.js", "--language", "javascript"];
		const basicArgv = {
			$0: "index.js",
			force: false,
			language: ["javascript"],
		};

		const outOfBoundsMessage =
			"The provided limit is not within the allowed range (1-500).";
		const cappedMessage = `Warning: Limit capped at ${STDOUT_LIMIT} to prevent terminal flooding. Use JSON or CSV for more results.`;

		test("normal execution", async () => {
			process.argv = [...preset, "--limit", 40];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					limit: 40,
					"output-format": "stdout",
				}),
			);

			process.argv = [...preset, "--limit", 150, "--output-format", "json"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					limit: 150,
					"output-format": "json",
				}),
			);

			process.argv = [...preset, "--limit", 450, "--output-format", "json"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					limit: 450,
					"output-format": "json",
				}),
			);
		});

		test("string argument", async () => {
			process.argv = [...preset, "--limit", "abc"];
			await expect(processArguments()).rejects.toThrow(
				"--limit must be a number",
			);
		});

		// out-of-bounds (<=0 and >500)
		test("out-of-bounds (<=0 and >500)", async () => {
			process.argv = [...preset, "--limit", -10];
			await expect(processArguments()).rejects.toThrow(outOfBoundsMessage);

			process.argv = [...preset, "--limit", 0];
			await expect(processArguments()).rejects.toThrow(outOfBoundsMessage);

			process.argv = [...preset, "--limit", 501];
			await expect(processArguments()).rejects.toThrow(outOfBoundsMessage);

			process.argv = [...preset, "--limit", 1000];
			await expect(processArguments()).rejects.toThrow(outOfBoundsMessage);
		});

		// warn when capping limit
		test("warn when limit is capped", async () => {
			jest.spyOn(console, "warn").mockImplementation();
			process.argv = [...preset, "--limit", 51];
			await processArguments();

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining(cappedMessage),
			);
		});
	});

	// OUTPUT FORMAT + OUTPUT NAME

	describe("--output-format and --output-name arguments", () => {
		const preset = ["node", "index.js", "--language", "javascript"];
		const basicArgv = {
			$0: "index.js",
			force: false,
			language: ["javascript"],
		};

		const noNameOnStdoutMessage =
			"Cannot set output name when output format is stdout.";

		// normal executon (separately (diverse inputs) and mixed)

		test("normal execution", async () => {
			process.argv = [...preset];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"output-format": "stdout",
				}),
			);

			process.argv = [...preset, "--output-format", "stdout"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"output-format": "stdout",
				}),
			);

			process.argv = [
				...preset,
				"--output-name",
				"my-results",
				"--output-format",
				"json",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"output-format": "json",
					"output-name": "my-results.json",
				}),
			);

			process.argv = [
				...preset,
				"--output-name",
				123,
				"--output-format",
				"json",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"output-format": "json",
					"output-name": "123.json",
				}),
			);

			process.argv = [
				...preset,
				"--output-name",
				"grou3439;',./!\!\"£$%^&*()\\|?><@:}{-=_+`¬",
				"--output-format",
				"json",
			];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"output-format": "json",
					"output-name": "grou3439;',./!\!\"£$%^&*()\\|?><@:}{-=_+`¬.json",
				}),
			);
		});

		// confirmOverwrite was called

		test("confirmOverwrite was called", async () => {
			process.argv = [...preset, "--output-format", "json"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"output-format": "json",
					"output-name": "repo-seek-results.json",
				}),
			);

			expect(global.confirmOverwriteCalled).toBe(true);
			global.confirmOverwriteCalled = false;

			process.argv = [...preset, "--output-format", "csv"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					"output-format": "csv",
					"output-name": "repo-seek-results.csv",
				}),
			);

			expect(global.confirmOverwriteCalled).toBe(true);
		});

		test("using --output-name when --output-format is stdout", async () => {
			process.argv = [...preset, "--output-name", "my-results.json"];
			await expect(processArguments()).rejects.toThrow(noNameOnStdoutMessage);

			process.argv = [
				...preset,
				"--output-name",
				"my-results.json",
				"--output-format",
				"stdout",
			];
			await expect(processArguments()).rejects.toThrow(noNameOnStdoutMessage);
		});

		test("invalid values for --output-format", async () => {
			process.argv = [...preset, "--output-format", "table"];
			await expect(processArguments()).rejects.toThrow(
				/^Invalid values:\n\s*Argument: output-format, Given: "table"/,
			);

			process.argv = [...preset, "--output-format", "pdf"];
			await expect(processArguments()).rejects.toThrow(
				/^Invalid values:\n\s*Argument: output-format, Given: "pdf"/,
			);

			process.argv = [...preset, "--output-format", "document"];
			await expect(processArguments()).rejects.toThrow(
				/^Invalid values:\n\s*Argument: output-format, Given: "document"/,
			);

			process.argv = [...preset, "--output-format", 123];
			await expect(processArguments()).rejects.toThrow(
				/^Invalid values:\n\s*Argument: output-format, Given: "123"/,
			);
		});
	});

	// FORCE

	describe("--force testing", () => {
		const preset = ["node", "index.js", "--language", "javascript"];
		const basicArgv = {
			$0: "index.js",
			language: ["javascript"],
			limit: 30,
		};

		test("normal execution", async () => {
			process.argv = [...preset, "--output-format", "json"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					force: false,
					"output-format": "json",
					"output-name": "repo-seek-results.json",
				}),
			);

			expect(global.confirmOverwriteCalled).toBe(true);
			global.confirmOverwriteCalled = false;

			process.argv = [...preset, "--force", "--output-format", "json"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					force: true,
					"output-format": "json",
					"output-name": "repo-seek-results.json",
				}),
			);

			expect(global.confirmOverwriteCalled).toBe(false);
		});
	});

	// RAW

	describe("--raw testing", () => {
		const preset = ["node", "index.js", "--language", "javascript"];
		const basicArgv = {
			$0: "index.js",
			language: ["javascript"],
			limit: 30,
			"output-format": "stdout",
			force: false,
		};

		test("normal execution", async () => {
			process.argv = [...preset, "--raw"];
			await expect(processArguments()).resolves.toEqual(
				expect.objectContaining({
					...basicArgv,
					raw: true,
				}),
			);
		});
	});
});
