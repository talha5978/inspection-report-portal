import { API_URL } from "~/lib/fetch.config";
import type { AssignDocResponse, DocumentDetail, DocumentListResponse } from "~/types/documents";
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

export async function assignDocument(
	token: string,
	documentId: string,
	clientIds: string[],
): ApiResponse<AssignDocResponse> {
	const res = await fetch(`${ROUTE_BASE}/assign`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ documentId, clientIds }),
	});

	const data = await res.json();
	return data;
}

export async function getDocumentDetail(
	token: string,
	documentId: string,
	pageSize?: number,
): ApiResponse<DocumentDetail> {
	const params = new URLSearchParams();

	if (pageSize !== undefined) params.append("pageSize", pageSize.toString());

	const url = `${ROUTE_BASE}/document/${documentId}${params.toString() ? `?${params.toString()}` : ""}`;

	const res = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	const data = await res.json();
	return data;
}

export async function unassignClient(
	token: string,
	documentId: string,
	clientId: string,
): ApiResponse<{ deleted: boolean }> {
	const res = await fetch(`${ROUTE_BASE}/unassign`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ documentId, clientId }),
	});

	return res.json();
}

export async function deleteDocument(token: string, documentId: string) {
	const res = await fetch(`${ROUTE_BASE}/document/${documentId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await res.json();
	return data;
}
