export default async function tryWithErrorHandling(fn, label) {
	try {
		return await fn();
	} catch (err) {
		console.error(`${label} error:- \n${err.message}`);
		process.exit(1);
	}
}
