import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	route("sign-in/*", "./routes/Auth/sign-in.tsx"),

	route("view/:shortCode", "./routes/QR/view.ts"),

	layout("./routes/protected-layout.tsx", [index("./routes/home.tsx")]),
] satisfies RouteConfig;
