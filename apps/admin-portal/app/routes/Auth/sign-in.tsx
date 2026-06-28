import { SignIn } from "@clerk/react-router";

export default function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<SignIn
				afterSignOutUrl={"/sign-in"}
				forceRedirectUrl={`${process.env.ADMIN_PORTAL_URL}/create-user`}
			/>
		</div>
	);
}
