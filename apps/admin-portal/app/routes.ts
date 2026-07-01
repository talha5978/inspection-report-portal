import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
	route("sign-in/*", "./routes/Auth/sign-in.tsx"),

	route("/", "./routes/protected-layout.tsx", [
		index("./routes/home.tsx"),

		...prefix("documents", [
			index("./routes/Documents/documents.tsx"),
			route("new", "./routes/Documents/new.tsx"),
		]),

		...prefix("clients", [
			index("./routes/Clients/clients.tsx"),
			route("new", "./routes/Clients/new.tsx"),
		]),

		route("qr-codes", "./routes/QR/qr-codes.tsx"),
	]),
] satisfies RouteConfig;
