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

export type AssignDocResponse = {
	assignedCount: number;
	totalRequested: number;
};

export type DocumentDetail = {
	document: {
		id: string;
		title: string;
		fileName: string;
		fileUrl: string;
		createdAt: Date;
		assignedClients: number;
	};
	assignedClients: {
		id: string;
		name: string;
		email: string;
		isActive: boolean;
	}[];
};
