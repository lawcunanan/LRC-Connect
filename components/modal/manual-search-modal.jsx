"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Modal } from "./index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";
import EmptyState from "@/components/tags/empty";
import { Checkbox } from "@/components/ui/checkbox";
import { FiSearch, FiCamera, FiUserPlus, FiChevronDown } from "react-icons/fi";

import { LoadingSpinner } from "@/components/loading";
import { useLoading } from "@/contexts/LoadingProvider";
import { ScannerModal } from "@/components/modal/scanner-modal";

import { getInactiveUserList } from "@/controller/firebase/get/getInactiveUser";
import { activateUsers } from "@/controller/firebase/update/updateActivateUsers";

export function ManualSearchModal({
	isOpen,
	onClose,
	userType,
	li_id,
	modifiedBy,
	Alert,
}) {
	const { setLoading, setPath, loading } = useLoading();
	const pathname = usePathname();
	const [btnLoading, setBtnLoading] = useState(false);

	const [userData, setUserData] = useState([]);
	const [selectedAccounts, setSelectedAccounts] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedType, setSelectedType] = useState("All");

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	const handleSelectAccount = (account) => {
		setSelectedAccounts((prev) => {
			const exists = prev.find((item) => item.us_id === account?.us_id);
			return exists
				? prev.filter((item) => item.us_id !== account?.us_id)
				: [...prev, account];
		});
	};

	const handleAddSelected = async () => {
		if (li_id) {
			await activateUsers(
				li_id,
				modifiedBy,
				selectedAccounts,
				setBtnLoading,
				Alert,
			);
			setUserData([]);
			setSelectedAccounts([]);
			onClose();
		}
	};

	useEffect(() => {
		if (!isOpen) return;

		setPath(pathname);
		const unsubscribe = getInactiveUserList(
			li_id,
			setUserData,
			searchQuery,
			userType,
			selectedType,
			selectedStatus,
			setLoading,
			Alert,
		);

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [searchQuery, selectedType, selectedStatus, userType, isOpen]);

	useEffect(() => {
		setUserData([]);
		setSelectedAccounts([]);
		setSelectedType("All");
		setSelectedStatus("All");
	}, [isOpen]);

	if (!isOpen) return null;
	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title="Add Existing Account"
				size="xl"
			>
				<div className="p-6">
					<div className="flex items-center gap-4 mb-6 justify-between">
						<div
							className={`relative flex-1 border border-border rounded-md ${
								userType === "patron" ? "max-w-sm" : "max-w-lg"
							}`}
						>
							<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
							<Input
								placeholder="Search users..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 pr-10 h-9 bg-background border-none text-foreground rounded-md shadow-sm"
							/>
							<div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
								<div className="relative">
									<Select value={selectedType} onValueChange={setSelectedType}>
										<SelectTrigger className="h-full pl-2 pr-6 text-xs focus:outline-none bg-background appearance-none text-sm">
											<SelectValue placeholder="All User Types" />
										</SelectTrigger>
										<SelectContent>
											{userType === "patron" ? (
												<>
													<SelectItem value="All">All User Types</SelectItem>
													<SelectGroup label="Patrons">
														<SelectLabel>Patrons</SelectLabel>
														<SelectItem value="Student">Student</SelectItem>
														<SelectItem value="Faculty">Faculty</SelectItem>
														<SelectItem value="Administrator">
															Administrator
														</SelectItem>
													</SelectGroup>
												</>
											) : (
												<>
													<SelectItem value="All">All Type</SelectItem>
													<SelectGroup label="Assistants">
														<SelectLabel>Assistants</SelectLabel>
														<SelectItem value="Student Assistant">
															Student Assistant
														</SelectItem>
														<SelectItem value="Administrative Assistant">
															Administrative Assistant
														</SelectItem>
													</SelectGroup>
													<SelectGroup label="Librarians">
														<SelectLabel>Librarians</SelectLabel>
														<SelectItem value="Chief Librarian">
															Chief Librarian
														</SelectItem>
														<SelectItem value="Head Librarian">
															Head Librarian
														</SelectItem>
													</SelectGroup>
												</>
											)}
										</SelectContent>
									</Select>
								</div>

								{userType !== "patron" && (
									<div className="relative">
										<Select
											value={selectedStatus}
											onValueChange={setSelectedStatus}
										>
											<SelectTrigger className="h-full pl-2 pr-6 text-xs focus:outline-none bg-background appearance-none text-sm">
												<SelectValue placeholder="All Account Status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="All">All Account Status</SelectItem>
												<SelectItem value="Active">Active</SelectItem>
												<SelectItem value="Inactive">Inactive</SelectItem>
											</SelectContent>
										</Select>
									</div>
								)}
							</div>
						</div>

						<Button
							onClick={() => setIsScannerOpen(true)}
							variant="outline"
							className="bg-transparent border-border hover:bg-accent text-foreground h-10 w-fit text-sm"
						>
							<FiCamera className="w-4 h-4 mr-2" />
							Switch to Scanner
						</Button>
					</div>

					<div className="flex items-center justify-between mb-4">
						<p className="text-primary text-sm">
							{userData?.length} accounts found
							{selectedAccounts.length > 0 &&
								` • ${selectedAccounts.length} selected`}
						</p>

						{selectedAccounts.length > 0 && (
							<Button
								onClick={handleAddSelected}
								className="bg-primary-custom hover:bg-secondary-custom text-white h-9 w-fit text-sm"
							>
								{!btnLoading ? (
									<FiUserPlus className="w-4 h-4 mr-2" />
								) : (
									<LoadingSpinner loading={btnLoading} />
								)}
								Add Selected ({selectedAccounts.length})
							</Button>
						)}
					</div>

					<div className="space-y-3  overflow-x-auto">
						<table className="w-full">
							<thead className="bg-muted/100">
								<tr className="border-b border-border">
									{[
										<Checkbox
											checked={
												selectedAccounts.length === userData?.length
													? true
													: selectedAccounts.length > 0
														? "indeterminate"
														: false
											}
											onCheckedChange={(checked) => {
												if (checked === true) {
													setSelectedAccounts(userData);
												} else {
													setSelectedAccounts([]);
												}
											}}
										/>,
										"Avatar",
										"School ID",
										"Status",
										"User Type",
										"Fullname",
										"Email",
										...(typeof userType === "string" && userType === "patron"
											? [
													"Course",
													"Year",
													"Track/Institute",
													"Strand/Program",
													"Section",
												]
											: []),
									].map((header) => (
										<th
											key={header}
											className="text-left py-4 px-6 font-semibold text-foreground text-sm"
										>
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="align-top">
								{userData?.map((account, index) => (
									<tr
										key={index}
										className={`border-b border-border hover:bg-accent/30 transition-colors ${
											index % 2 === 0 ? "bg-background" : "bg-muted/10"
										}`}
									>
										<td className="py-4 px-6 text-sm">
											<Checkbox
												checked={
													!!selectedAccounts.find(
														(a) => a.us_id === account?.us_id,
													)
												}
												onCheckedChange={() => handleSelectAccount(account)}
											/>
										</td>
										<td className="py-4 px-6 flex text-sm">
											<img
												src={account?.us_photoURL || "/placeholder.svg"}
												alt="avatar"
												className="w-12 h-12 rounded-full object-cover bg-gray-100 flex-shrink-0"
											/>
										</td>
										<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
											{account?.us_schoolID}
										</td>
										<td className="py-4 px-6 min-w-[130px] text-sm text-foreground">
											<Badge
												className={getStatColor(account?.us_status)}
												variant="secondary"
											>
												{account?.us_status}
											</Badge>
										</td>
										<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
											<Badge
												className={getTypeColor(account?.us_type)}
												variant="secondary"
											>
												{account?.us_type}
											</Badge>
										</td>
										<td className="py-4 px-6 min-w-[200px] text-sm text-foreground font-medium">
											{account?.us_name}
										</td>

										<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
											{account?.us_email}
										</td>
										{userType === "patron" && (
											<>
												<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
													{account?.us_courses}
												</td>

												<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
													{account?.us_year}
												</td>
												<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
													{account?.us_tracks || account?.us_institute}
												</td>
												<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
													{account?.us_strand || account?.us_program}
												</td>
												<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
													{account?.us_section}
												</td>
											</>
										)}
									</tr>
								))}
							</tbody>
						</table>

						<EmptyState data={userData} loading={loading} />
					</div>
				</div>
			</Modal>

			<ScannerModal
				isOpen={isScannerOpen}
				onClose={() => setIsScannerOpen(false)}
				setResult={setSearchQuery}
				allowedPrefix="USR"
			/>
		</>
	);
}

const getTypeColor = (type) => {
	switch (type) {
		case "Student":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
		case "Faculty":
			return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
		default:
			return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400";
	}
};

const getStatColor = (type) => {
	switch (type) {
		case "Active":
			return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
		default:
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
	}
};
