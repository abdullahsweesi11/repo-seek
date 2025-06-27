export default async function tryWithErrorHandling(fn, label) {
	try {
		return await fn();
	} catch (err) {
        const newErr = new Error(err.message);
        newErr.name = label;
        throw newErr;
	}
}
