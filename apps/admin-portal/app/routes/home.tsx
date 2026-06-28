// import { getAuth } from "@clerk/react-router/server";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export const loader = async (args: Route.LoaderArgs) => {
	// const { userId, isAuthenticated } = await getAuth(args)
	// console.log(userId, isAuthenticated);
};

export default function Home() {
	return (
		<div>
			<h1 className="text-5xl">HOME</h1>
			<p className="text-muted-foreground">Welcome to React Router!</p>
		</div>
	);
}
