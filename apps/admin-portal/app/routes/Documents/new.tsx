import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Loader2, Upload, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import BackButton from "~/components/Nav/BackButton";
import { createDocument } from "~/api/documents";
import { getToken } from "@clerk/react-router";
import { Label } from "~/components/ui/label";
import { Link, useNavigate } from "react-router";
import AssignClientsDialog from "~/components/Documents/AssignClientsDialog";

const NewDocumentSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters")
		.refine((value) => value.trim() !== "", {
			message: "Title is required",
		}),
});

type NewDocumentInput = z.infer<typeof NewDocumentSchema>;

export function meta() {
	return [
		{ title: "Upload New Document" },
		{ name: "description", content: "Upload a new document to the system" },
	];
}

export default function NewDocumentPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [createdDocument, setCreatedDocument] = useState<any>(null);
	const [showAssignDialog, setShowAssignDialog] = useState(false);
	const navigate = useNavigate();

	const form = useForm<NewDocumentInput>({
		resolver: zodResolver(NewDocumentSchema),
		defaultValues: {
			title: "",
		},
	});

	const onSubmit = async (values: NewDocumentInput) => {
		if (!selectedFile) {
			toast.error("Please select a PDF file");
			return;
		}

		setIsSubmitting(true);

		const formData = new FormData();
		formData.append("title", values.title);
		formData.append("file", selectedFile);

		try {
			const token = await getToken();
			const result = await createDocument(token!, formData);

			if (result.success) {
				toast.success("Document uploaded successfully!");
				setCreatedDocument(result.data.document);
				setShowAssignDialog(true); // Open assignment dialog
				form.reset();
				setSelectedFile(null);
			} else {
				toast.error(result.error?.message || "Failed to upload document");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleAssignEnd = () => {
		setShowAssignDialog(false);
		navigate("/documents");
	};

	return (
		<div className="max-w-2xl mx-auto py-6 px-4">
			<div className="flex items-center flex-wrap gap-4 mb-8">
				<BackButton href="/documents" />
				<div>
					<h1 className="text-3xl font-semibold tracking-tight">Upload New Document</h1>
					<p className="text-muted-foreground">Add a new inspection report to the system</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="w-5 h-5" />
						Document Details
					</CardTitle>
					<CardDescription>Upload a PDF report and provide basic information</CardDescription>
				</CardHeader>

				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Title */}
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Document Title</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g. Electrical Inspection Report - June 2026"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* PDF Upload */}
							<div>
								<Label className="mb-2 block">PDF Report</Label>
								<div
									className={`border-2 border-dashed rounded-xl p-8 text-center transition-all hover:border-primary/50 cursor-pointer ${
										selectedFile
											? "border-primary bg-primary/5"
											: "border-muted-foreground/25"
									}`}
									onClick={() => document.getElementById("file-upload")?.click()}
								>
									<Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
									<p className="font-medium">
										{selectedFile ? selectedFile.name : "Click to upload PDF"}
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedFile ? "" : "PDF files only • Max 50MB"}
									</p>
								</div>

								<input
									id="file-upload"
									type="file"
									accept=".pdf"
									className="hidden"
									onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
								/>
							</div>

							<div className="flex justify-end gap-4 pt-4">
								<Link to="/documents" replace viewTransition>
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</Link>
								<Button type="submit" disabled={isSubmitting || !selectedFile}>
									{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Upload Document
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{createdDocument && (
				<AssignClientsDialog
					documentId={createdDocument.id}
					documentTitle={createdDocument.title}
					open={showAssignDialog}
					onOpenChange={setShowAssignDialog}
					onSuccess={handleAssignEnd}
					onCancel={handleAssignEnd}
				/>
			)}
		</div>
	);
}
