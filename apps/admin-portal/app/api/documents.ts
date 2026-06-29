import { API_URL } from "~/lib/fetch.config";

export async function createDocument(token: string, body: any) {
	const res = await fetch(`${API_URL}/documents/create`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body,
	});

	const d = await res.json();
	return d;
}
