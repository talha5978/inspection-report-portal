import { SignIn } from "@clerk/react-router";

export function meta() {
	return [{ title: "Sign In" }, { name: "description", content: "Sign in to your admin portal!" }];
}

export default function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<SignIn
				appearance={{
					elements: {
						footerAction: { display: "none" },
					},
				}}
			/>
		</div>
	);
}
