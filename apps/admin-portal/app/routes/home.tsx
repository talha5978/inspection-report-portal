// import { getAuth } from "@clerk/react-router/server";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/home";
import { API_BASE_URL } from "~/lib/fetch.config";
import { getToken } from "@clerk/react-router";

export function meta({}: Route.MetaArgs) {
	return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export const loader = async (args: Route.LoaderArgs) => {
	// const { userId, isAuthenticated } = await getAuth(args)
	// console.log(userId, isAuthenticated);
};

export default function Home() {
	const handleClick = async () => {
		const token = await getToken();

		const r = await fetch(API_BASE_URL + "/api/documents/create", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});

		const d = await r.json();

		console.log(d);
	};

	return (
		<div>
			<h1 className="text-5xl">HOME</h1>
			<p className="text-muted-foreground">Welcome to React Router!</p>
			<Button onClick={handleClick}>Get User</Button>
		</div>
	);
}
