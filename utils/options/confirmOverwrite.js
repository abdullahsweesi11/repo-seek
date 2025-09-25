import path from "node:path";
import rlPromises from "node:readline/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getFilePath(filename) {
	return path.join(__dirname, "..", "..", `${filename}`);
}

export default async function confirmOverwrite(file) {
	const rl = rlPromises.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	let answer = await rl.question(
		`Are you sure you want to overwrite '${file}' (Y/n)? `,
	);
	rl.close();
	
	console.log("\n")

	answer = answer.trim().toLowerCase();
	if (["n", "no"].includes(answer)) return false;
	return true;
}
