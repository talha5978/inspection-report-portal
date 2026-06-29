import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
	route("sign-in/*", "./routes/Auth/sign-in.tsx"),
	route("sign-up/*", "./routes/Auth/sign-up.tsx"),

	route("create-user", "./routes/Auth/create-user.tsx"),

	index("routes/home.tsx"),

	...prefix("documents", [
		index("./routes/Documents/documents.tsx"),
		route("new", "./routes/Documents/new.tsx"),
	]),

	...prefix("clients", [index("./routes/Clients/clients.tsx"), route("new", "./routes/Clients/new.tsx")]),
] satisfies RouteConfig;
