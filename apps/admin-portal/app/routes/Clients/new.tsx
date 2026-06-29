import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import BackButton from "~/components/Nav/BackButton";
import { createClient } from "~/api/auth";
import { getToken } from "@clerk/react-router";
import { useNavigate } from "react-router";

const NewClientSchema = z.object({
	firstName: z
		.string()
		.min(2, "First name must be at least 2 characters")
		.refine((value) => value.trim() !== "", {
			message: "First name is required",
		}),
	lastName: z
		.string()
		.min(2, "Last name must be at least 2 characters")
		.refine((value) => value.trim() !== "", {
			message: "v is required",
		}),
	email: z
		.string()
		.email("Please enter a valid email address")
		.refine((value) => value.trim() !== "", {
			message: "Email address is required",
		}),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.refine((value) => value.trim() !== "", {
			message: "Password is required",
		}),
});

type NewClientInput = z.infer<typeof NewClientSchema>;

export function meta() {
	return [{ title: "Create New Client" }, { name: "description", content: "Create a new client account" }];
}

export default function NewClientPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const form = useForm<NewClientInput>({
		resolver: zodResolver(NewClientSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: NewClientInput) => {
		setIsSubmitting(true);

		const formData = {
			firstName: values.firstName.trim(),
			lastName: values.lastName.trim(),
			email: values.email.toLowerCase().trim(),
			password: values.password,
		};

		try {
			const token = await getToken();
			const result = await createClient(token!, formData);

			if (result.success) {
				toast.success("Client account created successfully!");
				navigate("/clients");
			} else {
				toast.error(result.error?.message || "Failed to create client");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-md mx-auto py-10 px-4">
			<div className="flex items-center gap-4 mb-8">
				<BackButton href="/clients" />
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Create New Client</h1>
					<p className="text-muted-foreground">Add a new client to the system</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-3">
						<UserPlus className="w-6 h-6" />
						Client Information
					</CardTitle>
					<CardDescription>Enter the client's details to create their account</CardDescription>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First Name</FormLabel>
											<FormControl>
												<Input placeholder="John" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last Name</FormLabel>
											<FormControl>
												<Input placeholder="Doe" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email Address</FormLabel>
										<FormControl>
											<Input type="email" placeholder="client@example.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Minimum 8 characters"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-4 pt-4">
								<Button type="button" variant="outline" onClick={() => navigate("/clients")}>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Create Client Account
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
