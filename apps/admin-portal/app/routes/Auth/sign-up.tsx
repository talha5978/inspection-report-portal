import { SignUp } from "@clerk/react-router";

export default function SignUpPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<SignUp forceRedirectUrl={`${process.env.ADMIN_PORTAL_URL}/create-user`} />
		</div>
	);
}
