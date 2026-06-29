export type SuccessResponse<T = any> = {
	success: boolean;
	data: T;
	message?: string;
};

export type ErrorResponse = {
	success: boolean;
	error: {
		code: string;
		message: string;
	};
};

export type ApiResponse<T = any> = Promise<SuccessResponse<T> | ErrorResponse>;
