export type DocumentListResponse = {
	documents: {
		id: string;
		title: string;
		fileName: string;
		fileUrl: string;
		createdAt: Date;
		assignedClients: number;
	}[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		pageCount: number;
	};
};
