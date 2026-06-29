import { API_URL } from "~/lib/fetch.config";

export async function createClient(
	token: string,
	data: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	},
) {
	const res = await fetch(`${API_URL}/auth/create-client`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	return res.json();
}
