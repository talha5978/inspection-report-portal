import { API_URL } from "~/lib/fetch.config";
import type { ApiResponse } from "~/types/response";
import { type QrCode } from "@inspection-report-portal/db";

const ROUTE_BASE = `${API_URL}/qrcodes`;

export async function createQrCode(
	token: string,
	body: { documentId: string; equipmentName: string | null; equipmentLocation: string | null },
): ApiResponse<QrCode> {
	const res = await fetch(`${ROUTE_BASE}/create`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const d = await res.json();
	return d;
}

export async function getDocumentByQR(shortCode: string): ApiResponse<{ fileUrl: string }> {
	const res = await fetch(`${ROUTE_BASE}/view/${shortCode}`, {
		method: "GET",
	});

	const data = await res.json();
	return data;
}
