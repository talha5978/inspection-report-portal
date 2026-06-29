import { google } from "googleapis";
import readline from "readline";

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI,
);

const authUrl = oauth2Client.generateAuthUrl({
	access_type: "offline",
	scope: ["https://www.googleapis.com/auth/drive.file"],
});

console.log("Open this URL:", authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Paste the code here: ", async (code) => {
	const { tokens } = await oauth2Client.getToken(code);
	console.log("\nYour Refresh Token:\n", tokens.refresh_token);
	rl.close();
});
