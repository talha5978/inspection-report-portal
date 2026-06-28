import { redirect } from "react-router";
import type { Route } from "./+types/create-user";
import { getAuth } from "@clerk/react-router/server";

export async function loader(args: Route.LoaderArgs) {
	const auth = await getAuth(args);

	if (!auth.userId) {
		return redirect("/sign-in");
	}

	return redirect("/");
}

export default function Page() {
	return <div>Setting up your account...</div>;
}
