import { useClerk } from "@clerk/react-router";
import { LogOutIcon, Settings, User } from "lucide-react";
import type { ComponentProps } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

export function Header({ className, ...props }: ComponentProps<"header">) {
	const { signOut } = useClerk();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await signOut();
		navigate("/sign-in");
	};

	return (
		<header
			className={cn(
				"flex h-12 px-4 w-full items-center justify-between bg-sidebar border-b-border border-b",
				className,
			)}
			{...props}
		>
			{/* Left side: Logo */}
			<Link to="/" viewTransition prefetch="intent">
				<img src="/logo.png" alt="Home" className="max-h-8" />
				<span className="sr-only">Home</span>
			</Link>

			{/* Right side: Account Avatar Button */}
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button
						variant="outline"
						size="icon"
						className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
						aria-label="User Account"
					>
						<img
							src="https://api.dicebear.com/7.x/avataaars/svg?seed=Talha"
							alt="User avatar"
							className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-200"
						/>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="max-w-md">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<User />
						Profile
					</DropdownMenuItem>

					<DropdownMenuItem>
						<Settings />
						Settings
					</DropdownMenuItem>
					<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
						<LogOutIcon />
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
