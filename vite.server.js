const express = require("express");
const { createServer: createViteServer } = require("vite");
const os = require("os");
const { defineConfig } = require("vite");
const viteConfig = defineConfig({
	server: {
		port: 4000,
		hmr: false,
		middlewareMode: "ssr",
	},
});

const fs = require("fs");
const html = fs.readFileSync("index.html").toString();
//  use express or connect or koa
const app = express();
async function createServer() {
	console.log(viteConfig);
	const vite = await createViteServer(viteConfig);
	const port = viteConfig.server.port;
	//  https://vitejs.dev/config/#server-middlewaremode
	//  https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server
	app.use(vite.middlewares);

	app.use("*", async (req, res, next) => {
		const url = req.originalUrl;
		const accept = req.headers["accept"];
		//  exclude non-text-html request
		if (accept === "*/*") return next();
		if (!accept || !accept.startsWith("text/html")) return next();
		try {
			let name;
			if (url.startsWith("/a")) {
				name = "a";
			}
			if (url.startsWith("/b")) {
				name = "b";
			}
			// 1. Apply Vite HTML transforms. This injects the Vite HMR client, and
			//    also applies HTML transforms from Vite plugins, e.g. global preambles
			//    from @vitejs/plugin-react-refresh
			const src = `/src/${name}/index.js`;
			const template = await vite.transformIndexHtml(
				url,
				html.replace(
					"</body>",
					`<script type="module" src="${src}"></script></body>`
				)
			);
			//2. Send the rendered HTML back.
			res.status(200).set({ "Content-Type": "text/html" }).end(template);
		} catch (e) {
			console.error(e);
			res.status(500).end(e.message);
		}
	});
	app.listen(port, () => {
		//  from vite/src/node/logger.ts 190
		Object.values(os.networkInterfaces())
			.flatMap((nInterface) => nInterface ?? [])
			.filter((detail) => detail && detail.address && detail.family === "IPv4")
			.map((detail) => {
				const type = detail.address.includes("127.0.0.1")
					? "Local:   "
					: "Network: ";
				const host = detail.address.replace("127.0.0.1", "localhost");
				const url = `http://${host}:${port}`;
				return `  > ${type} ${url}`;
			})
			.forEach((msg) => console.log(msg));
	});
}
createServer();
