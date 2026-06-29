export type ClientsListResponse = {
	clients: {
		id: string;
		name: string;
		email: string;
		isActive: boolean;
		createdAt: Date;
	}[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		pageCount: number;
	};
};
