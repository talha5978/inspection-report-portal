import { API_URL } from "~/lib/fetch.config";

export async function createUser(token: string) {
	const res = await fetch(`${API_URL}/auth/create-client`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res;
}
