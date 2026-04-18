
/**
 * @typedef {Object} Env
 */

export default {
	/**
	 * @param {Request} request
	 * @param {Env} env
	 * @param {ExecutionContext} ctx
	 * @returns {Promise<Response>}
	 */
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const ua = request.headers.get('user-agent') ?? 'unknown';
		console.log(`Hello ${ua} at path ${url.pathname}!`);

		try {
			return await env.ASSETS.fetch(request);
		} catch (err) {
			return Response.json({ error: 'Internal server error' }, { status: 500 });
		}
	},
};
