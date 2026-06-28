import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
	plugins: [
		tailwindcss(),
		reactRouter(),
		viteCompression({
			verbose: true,
			disable: false,
			algorithm: "brotliCompress",
			ext: ".br",
		}),
	],
	resolve: {
		tsconfigPaths: true,
	},
});
