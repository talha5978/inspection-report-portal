import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	route("sign-in/*", "./routes/Auth/sign-in.tsx"),
	route("sign-up/*", "./routes/Auth/sign-up.tsx"),

	route("create-user", "./routes/Auth/create-user.tsx"),

	index("routes/home.tsx"),
] satisfies RouteConfig;
