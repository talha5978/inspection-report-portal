import { API_URL } from "~/lib/fetch.config";
import type { DocumentListResponse } from "~/types/documents";
import type { ApiResponse } from "~/types/response";

const ROUTE_BASE = `${API_URL}/documents`;

export async function createDocument(token: string, body: any) {
	const res = await fetch(`${ROUTE_BASE}/create`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body,
	});

	const d = await res.json();
	return d;
}

export async function getDocumentList(
	token: string,
	query: {
		pageIndex?: number;
		pageSize?: number;
		search?: string;
	} = {},
): ApiResponse<DocumentListResponse> {
	const params = new URLSearchParams();

	if (query.pageIndex !== undefined) params.append("pageIndex", query.pageIndex.toString());
	if (query.pageSize !== undefined) params.append("pageSize", query.pageSize.toString());
	if (query.search) params.append("search", query.search);

	const url = `${ROUTE_BASE}/list${params.toString() ? `?${params.toString()}` : ""}`;

	const res = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	const data: ApiResponse<DocumentListResponse> = await res.json();
	return data;
}
