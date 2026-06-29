import type { User } from "@clerk/react-router/server";
import { API_URL } from "~/lib/fetch.config";
import type { ClientsListResponse } from "~/types/clients";
import type { ApiResponse } from "~/types/response";

const ROUTE_BASE = `${API_URL}/auth`;

export async function createClient(
	token: string,
	data: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	},
): ApiResponse<User> {
	const res = await fetch(`${ROUTE_BASE}/create-client`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	return res.json();
}

export async function getClients(
	token: string,
	query: {
		pageIndex?: number;
		pageSize?: number;
		search?: string;
	} = {},
): ApiResponse<ClientsListResponse> {
	const params = new URLSearchParams();

	if (query.pageIndex !== undefined) params.append("pageIndex", query.pageIndex.toString());
	if (query.pageSize !== undefined) params.append("pageSize", query.pageSize.toString());
	if (query.search) params.append("search", query.search);

	const url = `${ROUTE_BASE}/clients${params.toString() ? `?${params.toString()}` : ""}`;

	const res = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	const data: ApiResponse<ClientsListResponse> = await res.json();
	return data;
}
