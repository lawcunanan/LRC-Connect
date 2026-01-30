"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import {
	FiFileText,
	FiBarChart2,
	FiTable,
	FiX,
	FiSearch,
	FiCamera,
} from "react-icons/fi";

import EmptyState from "@/components/tags/empty";
import DocumentPreviewPage from "@/components/tags/documentPreview";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { ScannerModal } from "@/components/modal/scanner-modal";
import PaginationControls from "@/components/tags/pagination";

import {
	getAudittrail,
	getAuditFilterData,
} from "../../controller/firebase/get/getAudittrail";

const userTypes = [
	{
		group: "Patrons",
		options: ["Student", "Faculty", "Administrator"],
	},
	{
		group: "Assistants",
		options: ["Student Assistant", "Administrative Assistant"],
	},
	{
		group: "Librarians",
		options: ["Chief Librarian", "Head Librarian"],
	},
	{
		group: "Admin",
		options: ["Super Admin"],
	},
];

const actionOptions = [
	{
		label: "CRUD",
		options: [
			{ value: "Create", label: "Create" },
			{ value: "Read", label: "Read" },
			{ value: "Update", label: "Update" },
			{ value: "Delete", label: "Delete" },
		],
	},
	{
		label: "Entry & Exit",
		options: [
			{ value: "Entry", label: "Entry" },
			{ value: "Exit", label: "Exit" },
		],
	},
	{
		label: "Security",
		options: [
			{ value: "Deactive", label: "Deactivate" },
			{ value: "Reset Password", label: "Reset Password" },
		],
	},
	{
		label: "Transaction",
		options: [
			{ value: "Reserved", label: "Reserved" },
			{ value: "Utilized", label: "Utilized" },
			{ value: "Completed", label: "Completed" },
			{ value: "Cancelled", label: "Cancelled" },
			{ value: "Report", label: "Report" },
		],
	},
	{
		label: "Essential Report",
		options: [{ value: "Print", label: "Print" }],
	},
];

export default function AuditPage() {
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [auditData, setAuditData] = useState([]);
	const [viewMode, setViewMode] = useState("table");

	// FILTER
	const [showFilters, setShowFilters] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [libraries, setLibraries] = useState([]);

	const [selectedLibrary, setSelectedLibrary] = useState("All");
	const [selectedStudLibrary, setSelectedStudLibrary] = useState("All");
	const [selectedAction, setSelectedAction] = useState("All");
	const [selectedusType, setSelectedUsType] = useState("All");
	const [selectedStatus, setSelectedStatus] = useState("All");
	const [selectedStartDate, setSelectedStartDate] = useState("All");
	const [selectedEndDate, setSelectedEndDate] = useState("All");

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 10;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);

		let unsubscribe;

		if (userDetails) {
			unsubscribe = getAudittrail(
				userDetails?.us_level == "USR-1"
					? selectedLibrary
					: userDetails?.us_liID,
				setAuditData,
				searchQuery,
				selectedStudLibrary,
				selectedusType,
				selectedAction,
				selectedStatus,
				selectedStartDate,
				selectedEndDate,

				setLoading,
				Alert,
				setCtrPage,
				pageLimit,
				pageCursors,
				setPageCursors,
				currentPage,
			);
		}

		return () => {
			if (typeof unsubscribe === "function") {
				unsubscribe();
			}
		};
	}, [
		userDetails,
		searchQuery,
		selectedLibrary,
		selectedStudLibrary,
		selectedusType,
		selectedAction,
		selectedStatus,
		selectedStartDate,
		selectedEndDate,
		currentPage,
	]);

	useEffect(() => {
		if (userDetails) {
			getAuditFilterData(setLibraries, Alert);
		}
	}, [userDetails]);

	useEffect(() => {
		if (userDetails?.us_level == "USR-1" && libraries && libraries[0]?.id) {
			setSelectedLibrary(libraries[0]?.id);
		}
	}, [libraries]);

	const getActiveFilters = () => {
		const filters = [];

		if (selectedLibrary !== "All") {
			filters.push({
				key: "library",
				label: "Library",
				value:
					libraries.find((lib) => lib.id === selectedLibrary)?.li_name ||
					"Unknown",
				onClear: () => setSelectedLibrary("All"),
			});
		}

		if (selectedStudLibrary !== "All") {
			filters.push({
				key: "studentlibrary",
				label: "Student Library",
				value:
					libraries.find((lib) => lib.id === selectedStudLibrary)?.li_name ||
					"Unknown",
				onClear: () => setSelectedStudLibrary("All"),
			});
		}

		if (selectedAction !== "All") {
			filters.push({
				key: "actionType",
				label: "Action Type",
				value: selectedAction,
				onClear: () => setSelectedAction("All"),
			});
		}

		if (selectedusType !== "All") {
			filters.push({
				key: "usType",
				label: "User Type",
				value: selectedusType,
				onClear: () => setSelectedUsType("All"),
			});
		}

		if (selectedStatus !== "All") {
			filters.push({
				key: "status",
				label: "Status",
				value: selectedStatus,
				onClear: () => setSelectedStatus("All"),
			});
		}

		if (selectedStartDate !== "All") {
			filters.push({
				key: "startDate",
				label: "Start Date",
				value: formatDate(selectedStartDate),
				onClear: () => setSelectedStartDate("All"),
			});
		}

		if (selectedEndDate !== "All") {
			filters.push({
				key: "endDate",
				label: "End Date",
				value: formatDate(selectedEndDate),
				onClear: () => setSelectedEndDate("All"),
			});
		}
		return filters;
	};

	const formatDate = (dateString) => {
		if (dateString === "All") return "All";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "High":
				return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
			case "Medium":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
			case "Low":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
		}
	};

	const renderChartPlaceholder = () => {
		return (
			<div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30">
				<div className="text-center">
					<FiBarChart2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
					<p className="text-muted-foreground text-base">
						Chart view coming soon
					</p>
					<p className="text-muted-foreground/70 mt-1 text-sm">
						Visual representation will be available in future updates
					</p>
				</div>
			</div>
		);
	};

	const renderTableContent = () => {
		return (
			<table className="w-full border border-border">
				<thead className="bg-muted">
					<tr className="border-b border-border">
						{[
							"Timestamp",
							"School ID",
							"Type",
							"Fullname",
							"Library",
							"Action Type",
							"Description",
							"Status",
							"IP Address",
							"Device",
						].map((header) => (
							<th
								key={header}
								className="text-center py-4 px-6 font-semibold text-foreground text-sm"
							>
								{header}
							</th>
						))}
					</tr>
				</thead>

				<tbody className="align-top">
					{auditData?.map((audit, index) => (
						<tr
							key={index}
							className={`border-b border-border hover:bg-accent/30 transition-colors ${
								index % 2 === 0 ? "bg-background" : "bg-muted/10"
							}`}
						>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[250px]">
								{audit?.au_createdAtFormatted}
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[120px]">
								{audit?.au_schoolId}
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[150px]">
								{audit?.au_userType}
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[250px]">
								{audit?.au_fullname}
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[350px]">
								{audit?.au_library}
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[130px]">
								{audit?.au_actionType}
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[350px] max-w-[600px]">
								{audit?.au_description}
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[80px]">
								<Badge className={getStatusColor(audit?.au_status)}>
									{audit?.au_status}
								</Badge>
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[120px]">
								{audit?.au_ipAddress}
							</td>
							<td className="py-4 px-6 text-center text-foreground text-sm min-w-[250px]">
								{audit?.au_device}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	};

	return (
		<ProtectedRoute allowedRoles={["USR-1", "USR-2", "USR-3"]}>
			{viewMode === "export" ? (
				<DocumentPreviewPage
					title={`System Activity Log (${auditData?.length} events)`}
					activeFilters={getActiveFilters()}
					renderTable={renderTableContent}
					setViewMode={setViewMode}
					userDetails={userDetails}
					Alert={Alert}
				/>
			) : (
				<div className="flex h-screen bg-background transition-colors duration-300">
					<Sidebar userRole="admin" />

					<div className="flex-1 flex flex-col overflow-hidden">
						<Header />

						<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
							<div className="mb-8 animate-fade-in">
								<h1 className="font-semibold text-foreground text-2xl mb-1">
									Audit Trail
								</h1>
								<p className="text-muted-foreground text-base">
									Track and monitor all system activities, user actions, and
									security events
								</p>
							</div>

							<Card className="p-6 bg-card border-border transition-colors duration-300 animate-slide-up animation-delay-400 ">
								<CardHeader className="p-0">
									<CardTitle className="font-semibold text-foreground text-lg mb-6">
										{`System Activity Log (${auditData?.length} events)`}
									</CardTitle>
									<div className="flex items-left justify-between flex-col sm:flex-row gap-4">
										<div className="relative flex items-center flex-1 max-w-lg border border-input rounded-md bg-background shadow-sm">
											<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
											<Input
												placeholder="Search user..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="pl-10 pr-4 h-9 bg-transparent border-0 focus:ring-0 text-foreground text-sm flex-1"
											/>
											<FiCamera
												onClick={() => setIsScannerOpen(true)}
												className="w-4 h-4 text-muted-foreground mx-2 cursor-pointer"
											/>
											<div className="h-6 w-px bg-border mx-2"></div>
											<Button
												onClick={() => setShowFilters(!showFilters)}
												variant="ghost"
												className="h-9 px-3 border-0 text-foreground hover:bg-accent text-sm rounded-l-none"
											>
												Filter
											</Button>
										</div>

										<div className="flex items-center gap-2">
											<div className="flex items-center border border-border rounded-md">
												<Button
													variant={viewMode === "table" ? "default" : "ghost"}
													size="sm"
													onClick={() => setViewMode("table")}
													className={`text-sm h-9 px-3 rounded-r-none ${
														viewMode === "table"
															? "bg-primary-custom text-white hover:bg-primary-custom/90"
															: "hover:bg-accent"
													}`}
												>
													<FiTable className="w-4 h-4 mr-1" />
													Table
												</Button>
												<Button
													variant={viewMode === "chart" ? "default" : "ghost"}
													size="sm"
													onClick={() => setViewMode("chart")}
													className={`text-sm h-9 px-3 rounded-l-none ${
														viewMode === "chart"
															? "bg-primary-custom text-white hover:bg-primary-custom/90"
															: "hover:bg-accent"
													}`}
												>
													<FiBarChart2 className="w-4 h-4 mr-1" />
													Chart
												</Button>
											</div>

											<Button
												onClick={() => setViewMode("export")}
												variant="outline"
												size="sm"
												className="h-9 bg-transparent border-border hover:bg-accent text-sm"
											>
												<FiFileText className="w-4 h-4 mr-1" />
												Preview
											</Button>
										</div>
									</div>

									{/* Active Filters */}
									{getActiveFilters().length > 0 && (
										<div
											className="flex items-center gap-2 mb-8 flex-wrap"
											style={{ marginTop: "15px" }}
										>
											<span className="text-muted-foreground text-sm">
												Active Filters:
											</span>

											{getActiveFilters().map((filter, index) => (
												<span
													key={index}
													className="px-2 py-1 bg-primary-custom/10 text-primary-custom rounded flex items-center gap-1 text-sm"
												>
													{filter.label}: {filter.value}
													<FiX
														className="w-3 h-3 cursor-pointer"
														onClick={filter.onClear}
													/>
												</span>
											))}
										</div>
									)}
								</CardHeader>

								<CardContent className="p-0 pt-8">
									{viewMode === "table" ? (
										<div className="overflow-x-auto rounded-lg">
											{renderTableContent()}
											<EmptyState data={auditData} loading={loading} />
										</div>
									) : (
										renderChartPlaceholder()
									)}

									<PaginationControls
										ctrPages={ctrPages}
										currentPage={currentPage}
										setCurrentPage={setCurrentPage}
									/>
								</CardContent>
							</Card>

							{showFilters && (
								<div className="fixed inset-0 z-50 transition-opacity duration-300 opacity-100">
									<div
										className="fixed inset-0 bg-black/50"
										onClick={() => setShowFilters(false)}
									/>
									<div className="relative bg-card w-80 h-full shadow-lg transform transition-transform duration-300 translate-x-0 animate-slide-in-left">
										<div className="flex items-center justify-between p-4 border-b border-border text-white bg-primary-custom">
											<h2 className="font-semibold text-white text-base">
												Filters
											</h2>
											<button
												onClick={() => setShowFilters(false)}
												className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
											>
												<FiX className="w-4 h-4" />
											</button>
										</div>

										<div className="p-4 space-y-4 overflow-y-auto h-full pb-24">
											{userDetails?.us_level == "USR-1" && (
												<div className="space-y-2">
													<label className="block font-medium text-foreground text-sm">
														Select a Library
													</label>
													<Select
														value={selectedLibrary}
														onValueChange={setSelectedLibrary}
													>
														<SelectTrigger className="w-full h-9 text-sm">
															<SelectValue placeholder="All Libraries" />
														</SelectTrigger>
														<SelectContent>
															{libraries.map((library) => (
																<SelectItem key={library.id} value={library.id}>
																	{library.li_name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											)}

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-sm">
													Select a Student Library
												</label>
												<Select
													value={selectedStudLibrary}
													onValueChange={setSelectedStudLibrary}
												>
													<SelectTrigger className="w-full h-9 text-sm">
														<SelectValue placeholder="All Libraries" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="All">All Libraries</SelectItem>
														{libraries.map((library) => (
															<SelectItem key={library.id} value={library.id}>
																{library.li_name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-sm">
													Select a User Type
												</label>
												<Select
													value={selectedusType}
													onValueChange={setSelectedUsType}
												>
													<SelectTrigger className="w-full h-9 text-sm">
														<SelectValue placeholder="All User Types" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="All">All User Types</SelectItem>
														{userTypes.map((group, idx) => (
															<SelectGroup key={idx}>
																<SelectLabel>{group.group}</SelectLabel>
																{group.options.map((option, i) => (
																	<SelectItem key={i} value={option}>
																		{option}
																	</SelectItem>
																))}
															</SelectGroup>
														))}
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-sm">
													Select an Action Type
												</label>
												<Select
													value={selectedAction}
													onValueChange={setSelectedAction}
												>
													<SelectTrigger className="w-full h-9 text-sm">
														<SelectValue placeholder="All Action Types" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="All">
															All Action Types
														</SelectItem>
														{actionOptions.map((group, index) => (
															<SelectGroup key={index}>
																<SelectLabel>{group.label}</SelectLabel>
																{group.options.map((opt) => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectGroup>
														))}
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground  text-sm">
													Select Severity Level Status
												</label>
												<Select
													value={selectedStatus}
													onValueChange={setSelectedStatus}
												>
													<SelectTrigger className="w-full h-9 text-sm">
														<SelectValue placeholder="Select Status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="Low">Low</SelectItem>
														<SelectItem value="Medium">Medium</SelectItem>
														<SelectItem value="High">High</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-sm">
													Start Date
												</label>
												<input
													type="date"
													value={selectedStartDate}
													onChange={(e) => setSelectedStartDate(e.target.value)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-sm"
												/>
											</div>

											<div className="space-y-2">
												<label className="block font-medium text-foreground text-sm">
													End Date
												</label>
												<input
													type="date"
													value={selectedEndDate}
													onChange={(e) => setSelectedEndDate(e.target.value)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 focus:ring-2 focus:ring-primary-custom focus:border-transparent text-sm"
												/>
											</div>
										</div>

										<div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
											<div className="flex space-x-3">
												<Button
													onClick={() => {
														setPageCursors([]);
														setCurrentPage(1);
														setSelectedLibrary("All");
														setSelectedStudLibrary("All");
														setSelectedAction("All");
														setSelectedUsType("All");
														setSelectedStatus("All");
														setSelectedStartDate("All");
														setSelectedEndDate("All");
														setShowFilters(false);
													}}
													variant="outline"
													className="flex-1 h-9 border-border  text-sm"
												>
													Clear All
												</Button>
												<Button
													onClick={() => setShowFilters(false)}
													className="flex-1 text-white hover:opacity-90 h-9 bg-primary-custom  text-sm"
												>
													Apply Filters
												</Button>
											</div>
										</div>
									</div>
								</div>
							)}
						</main>
					</div>

					<ScannerModal
						isOpen={isScannerOpen}
						onClose={() => setIsScannerOpen(false)}
						setResult={setSearchQuery}
						allowedPrefix="USR"
					/>
				</div>
			)}
		</ProtectedRoute>
	);
}
