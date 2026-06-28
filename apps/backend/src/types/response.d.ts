export type SuccessResponse<T = any> = {
	success: boolean;
	data: T;
	message?: string;
};
