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
	server: {
		port: 5173,
	},
	define: {
		"process.env.VITE_ENV": JSON.stringify(process.env.VITE_ENV),
		"process.env.CLERK_PUBLISHABLE_KEY": JSON.stringify(process.env.CLERK_PUBLISHABLE_KEY),
		"process.env.CLERK_SIGN_IN_URL": JSON.stringify(process.env.CLERK_SIGN_IN_URL),
		"process.env.CLERK_SIGN_UP_URL": JSON.stringify(process.env.CLERK_SIGN_UP_URL),
		global: "globalThis",
	},

	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: "globalThis",
			},
		},
	},
});
