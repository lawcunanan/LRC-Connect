"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";
import { FiX } from "react-icons/fi";
import { LoadingSpinner } from "@/components/loading";

import { changeUserType } from "@/controller/firebase/update/updateUserStatus";

export function UserTypeModal({
	isOpen,
	onClose,
	li_id,
	userData,
	modifiedBy,
	Alert,
}) {
	const [userType, setUserType] = useState("");
	const [btnLoading, setBtnLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!userData.us_id) return;
		await changeUserType(
			li_id,
			modifiedBy,
			userData.us_id,
			userData.us_name,
			userData.us_level,
			userType,
			userData.us_library,
			setBtnLoading,
			Alert,
		);
		resetForm();
	};

	const resetForm = () => {
		setUserType("");
		onClose();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="fixed inset-0 bg-black/50 transition-opacity"
				onClick={onClose}
			/>
			<Card className="relative bg-card border border-border rounded-lg shadow-lg w-full mx-4 max-w-md max-h-[90vh] overflow-hidden transition-colors duration-300">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
					<CardTitle className="text-base font-semibold flex items-center gap-2">
						Change User Type
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="h-8 w-8 p-0"
					>
						<FiX className="w-4 h-4" />
					</Button>
				</CardHeader>
				<CardContent className="p-0">
					<form
						onSubmit={handleSubmit}
						onKeyDown={handleKeyDown}
						className="p-6 space-y-4 max-h-[calc(90vh-80px)] overflow-y-auto"
					>
						<div>
							<label className="block text-foreground font-medium mb-2 text-sm">
								Select New User Type
							</label>
							<Select value={userType} onValueChange={setUserType}>
								<SelectTrigger className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-sm">
									<SelectValue placeholder="Select User Type" />
								</SelectTrigger>
								<SelectContent>
									{["USR-6", "USR-5"].includes(userData?.us_level) && (
										<SelectGroup>
											<SelectLabel>Patrons</SelectLabel>
											{["Student", "Faculty", "Administrator"].map((type) => (
												<SelectItem
													key={type}
													value={type}
													disabled={userData?.us_type === type}
												>
													{type}{" "}
													{userData?.us_type === type && "(Already Active)"}
												</SelectItem>
											))}
										</SelectGroup>
									)}

									<SelectGroup>
										<SelectLabel>Assistants</SelectLabel>
										{["USR-6", "USR-5"].includes(userData?.us_level) ? (
											<SelectItem
												value="Student Assistant"
												disabled={userData?.us_type === "Student Assistant"}
											>
												Student Assistant
												{userData?.us_type === "Student Assistant" &&
													" (Already Active)"}
											</SelectItem>
										) : (
											<SelectItem
												value="Administrative Assistant"
												disabled={
													userData?.us_type === "Administrative Assistant"
												}
											>
												Administrative Assistant
												{userData?.us_type === "Administrative Assistant" &&
													" (Already Active)"}
											</SelectItem>
										)}
									</SelectGroup>

									{!["USR-6", "USR-5"].includes(userData?.us_level) && (
										<SelectGroup>
											<SelectLabel>Librarians</SelectLabel>
											{["Chief Librarian", "Head Librarian"].map((type) => (
												<SelectItem
													key={type}
													value={type}
													disabled={userData?.us_type === type}
												>
													{type}{" "}
													{userData?.us_type === type && "(Already Active)"}
												</SelectItem>
											))}
										</SelectGroup>
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="flex gap-3 justify-end pt-2">
							<Button
								type="button"
								onClick={resetForm}
								variant="outline"
								className="bg-transparent h-10 px-4 text-sm"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={btnLoading || userType === userData?.us_type}
								className="bg-primary-custom text-white hover:opacity-90 h-10 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<LoadingSpinner loading={btnLoading} />
								Save Changes
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
