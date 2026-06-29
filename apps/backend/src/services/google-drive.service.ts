import { drive_v3, google } from "googleapis";
import { Readable } from "stream";
import { ApiError } from "~/utils/ApiError";

interface GoogleDriveFile {
	id: string;
	name: string;
	webViewLink: string;
	webContentLink?: string;
}

export class GoogleDriveService {
	private drive: drive_v3.Drive;

	constructor() {
		if (
			!process.env.GOOGLE_CLIENT_ID ||
			!process.env.GOOGLE_CLIENT_SECRET ||
			!process.env.GOOGLE_REDIRECT_URI ||
			!process.env.GOOGLE_REFRESH_TOKEN
		) {
			throw new ApiError(
				"GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI and GOOGLE_REFRESH_TOKEN are required",
				500,
				"INTERNAL_SERVER_ERROR",
			);
		}

		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID!,
			process.env.GOOGLE_CLIENT_SECRET!,
			process.env.GOOGLE_REDIRECT_URI!,
		);

		oauth2Client.setCredentials({
			refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
		});

		this.drive = google.drive({ version: "v3", auth: oauth2Client });
	}

	async uploadPDF(file: Buffer | Readable, fileName: string): Promise<GoogleDriveFile> {
		try {
			const response = await this.drive.files.create({
				requestBody: {
					name: fileName,
					mimeType: "application/pdf",
					parents: process.env.GOOGLE_DRIVE_FOLDER_ID
						? [process.env.GOOGLE_DRIVE_FOLDER_ID]
						: undefined,
				},
				media: {
					mimeType: "application/pdf",
					body: Readable.from(file),
				},
				fields: "id,name,webViewLink,webContentLink",
			});

			const fileData = response.data;

			return {
				id: fileData.id!,
				name: fileData.name!,
				webViewLink: fileData.webViewLink!,
				webContentLink: fileData.webContentLink ?? undefined,
			};
		} catch (error: any) {
			console.error("Google Drive upload error:", error.response?.data || error);
			throw new ApiError("Failed to upload to Google Drive", 500);
		}
	}

	async makeFilePublic(fileId: string) {
		await this.drive.permissions.create({
			fileId,
			requestBody: { role: "reader", type: "anyone" },
		});
	}
}

export const googleDriveService = new GoogleDriveService();
