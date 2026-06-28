import type { Route } from "./+types/home";
import { type DbClient } from "@inspection-report-portal/db";

let a: DbClient | null = null;
export function meta({}: Route.MetaArgs) {
	a = null;
	return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export default function Home() {
	return <p>Hola!</p>;
}
