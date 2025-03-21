
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
		console.log(`Hello ${navigator.userAgent} at path ${url.pathname}!`);

		/*
		if (url.pathname === "/api") {
			// You could also call a third party API here
			const data = await import("./data.js");
			return Response.json(data);
		}
		*/

		/*
    return new Promise((resolve) => {
      env.ASSETS.fetch(request).then((e) => {
        if (e.status === 404) {
          return resolve(Response.json({ error: "Not found" }, { status: 404 }));
        }

        resolve(e);
      });
    });
		*/
		env.ASSETS.fetch(request);
	},
};
