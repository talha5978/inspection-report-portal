export type QrCodesListResponse = {
	qrCodes: {
		id: string;
		shortCode: string;
		equipmentName: string | null;
		equipmentLocation: string | null;
		documentTitle: string;
		createdAt: Date;
	}[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		pageCount: number;
	};
};
