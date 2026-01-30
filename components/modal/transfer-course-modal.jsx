"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FiX } from "react-icons/fi";

import { LoadingSpinner } from "@/components/loading";
import { transferCourses } from "@/controller/firebase/update/updateCourses";

export function TransferCourseModal({
	isOpen,
	onClose,
	actionData = null,
	coursesData = [],
	Alert,
}) {
	const [btnLoading, setBtnLoading] = useState(false);
	const [selectedTarget, setSelectedTarget] = useState("");

	useEffect(() => {
		if (!isOpen) {
			setSelectedTarget("");
		}
	}, [isOpen]);

	const handleTransfer = async () => {
		if (!selectedTarget) return;

		await transferCourses(
			selectedTarget,
			actionData,
			coursesData,
			setBtnLoading,
			Alert,
		);
		onClose();
	};

	if (!isOpen || actionData?.mode !== "transfer") return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/50">
			<div className="absolute inset-0" onClick={onClose} />

			<Card
				role="dialog"
				aria-modal="true"
				className="relative z-10 w-full max-w-md mx-4 max-h-[90vh] flex flex-col bg-card border border-border rounded-xl shadow-lg overflow-hidden transform animate-slide-up scale-100 transition-transform duration-300"
			>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
					<CardTitle className="text-base font-semibold flex items-center gap-2">
						Transfer{" "}
						{actionData?.type?.charAt(0).toUpperCase() +
							actionData?.type?.slice(1) || "Course"}
					</CardTitle>
					<button
						onClick={onClose}
						aria-label="Close modal"
						className="p-2 hover:bg-accent rounded-md transition-colors"
					>
						<FiX className="w-4 h-4" />
					</button>
				</CardHeader>

				<CardContent className="p-6 space-y-6 overflow-y-auto text-sm text-muted-foreground">
					<div className="space-y-1">
						<Label className="font-medium text-foreground text-sm">
							Transfer{" "}
							<span className="font-semibold">{actionData?.title}</span> to:
						</Label>

						<Select value={selectedTarget} onValueChange={setSelectedTarget}>
							<SelectTrigger className="h-9 bg-background border-border text-foreground text-sm">
								<SelectValue placeholder="Select destination" />
							</SelectTrigger>

							<SelectContent>
								{coursesData
									.filter((target) => target.id !== actionData?.id)
									.map((target, index) => (
										<SelectItem
											key={index}
											value={target.id}
											className="text-sm"
										>
											{target.cs_title}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>

				<div className="flex justify-end gap-3 px-6 pb-6">
					<Button
						type="button"
						onClick={onClose}
						variant="outline"
						className="bg-transparent h-10 px-4 text-sm"
					>
						Cancel
					</Button>

					<Button
						type="button"
						onClick={handleTransfer}
						disabled={!selectedTarget || btnLoading}
						className="bg-primary-custom hover:bg-secondary-custom text-white text-sm h-10 px-4"
					>
						<LoadingSpinner loading={btnLoading} />
						Transfer
					</Button>
				</div>
			</Card>
		</div>
	);
}
