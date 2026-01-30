"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/tags/empty";
import { FiSearch, FiGrid, FiList, FiPlus, FiCamera } from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import { getDiscussionList } from "../../../controller/firebase/get/getDicussionroomList";
import { getStatusColor } from "@/controller/custom/getStatusColor";
import PaginationControls from "@/components/tags/pagination";
import { ScannerModal } from "@/components/modal/scanner-modal";

export default function discussionResourcesPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	const [viewType, setViewType] = useState("grid");
	const [discussionData, setDiscussionData] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("Active");

	//PAGINATION
	const [pageCursors, setPageCursors] = useState([]);
	const pageLimit = 5;
	const [currentPage, setCurrentPage] = useState(1);
	const [ctrPages, setCtrPage] = useState(1);

	useEffect(() => {
		setPath(pathname);
		if (userDetails && userDetails?.us_liID) {
			getDiscussionList(
				userDetails?.us_liID,
				setDiscussionData,
				selectedStatus,
				"",
				"",
				searchQuery,
				setLoading,
				Alert,
				setCtrPage,
				pageLimit,
				pageCursors,
				setPageCursors,
				currentPage,
			);
		}
	}, [userDetails, currentPage, selectedStatus, searchQuery]);

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />

				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 ">
						<div className="flex items-left justify-between mb-8 animate-slide-up flex-col sm:flex-row gap-4">
							<div className="w-fit">
								<h1 className="font-semibold text-foreground text-2xl mb-1">
									Discussion Room Resources
								</h1>
								<p className="text-muted-foreground text-base">
									Browse and manage all available discussion rooms and meeting
									spaces
								</p>
							</div>
							{userDetails &&
								["USR-2", "USR-3", "USR-4"].includes(userDetails?.us_level) && (
									<Button
										onClick={() =>
											router.push(
												"/resources/discussion/register?type=register",
											)
										}
										className="bg-primary text-white hover:opacity-90 h-9 px-4 flex items-center gap-2 w-fit font-normal text-sm"
									>
										<FiPlus className="w-4 h-4" />
										Register Room
									</Button>
								)}
						</div>

						<div className="mb-8 animate-slide-up-delay-1">
							<div className="flex items-center justify-between mb-4 gap-6">
								<div className="relative flex items-center flex-1 max-w-lg border border-input rounded-md bg-background shadow-sm">
									<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
									<Input
										placeholder="Search discussions..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 pr-32 h-9 bg-transparent border-0 focus:ring-0 text-foreground rounded-md shadow-sm text-sm"
									/>

									<div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-2">
										<FiCamera
											className="w-4 h-4 text-muted-foreground cursor-pointer"
											onClick={() => setIsScannerOpen(true)}
											title="Scan QR / Barcode"
										/>

										<div className="h-6 w-px bg-border mx-2"></div>
										<Select
											value={selectedStatus}
											onValueChange={(value) => setSelectedStatus(value)}
										>
											<SelectTrigger className="h-8 px-3 border-0 text-foreground hover:bg-accent rounded-l-none text-sm w-auto">
												<SelectValue placeholder="Filter" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Active">Active</SelectItem>
												<SelectItem value="Inactive">Inactive</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Button
										onClick={() => setViewType("grid")}
										variant={viewType === "grid" ? "default" : "outline"}
										size="sm"
										className={`h-9 border-none ${
											viewType === "grid"
												? "bg-primary-custom text-white"
												: "bg-background text-foreground hover:bg-accent shadow-sm"
										}`}
									>
										<FiGrid className="w-4 h-4" />
									</Button>
									<Button
										onClick={() => setViewType("table")}
										variant={viewType === "table" ? "default" : "outline"}
										size="sm"
										className={`h-9 border-none ${
											viewType === "table"
												? "bg-primary-custom text-white"
												: "bg-background text-foreground hover:bg-accent shadow-sm"
										}`}
									>
										<FiList className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</div>

						{/* Main Content */}
						<div className="flex-1  animate-slide-up-delay-2">
							{viewType === "grid" && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
									{discussionData.map((discussion, index) => (
										<Card
											key={index}
											className="bg-card border-none shadow-sm transition-colors duration-300 hover:shadow-md rounded-lg h-fit cursor-pointer"
											onClick={() =>
												router.push(
													`/resources/discussion/details?id=${discussion.id}`,
												)
											}
										>
											<CardContent className="flex gap-4 p-4">
												<img
													src={discussion.dr_photoURL || "/placeholder.svg"}
													alt="DR"
													className={`h-28 w-28 object-cover rounded-lg bg-gray-100 flex-shrink-0 `}
												/>

												<div className="flex-1 min-w-0 space-y-2">
													<div>
														<h4 className="font-medium text-foreground text-base mb-1">
															{discussion.dr_name}
														</h4>
														<p className="text-muted-foreground text-sm">
															{discussion.dr_createdAtFormatted}
														</p>
													</div>

													<div>
														<p className="text-sm">Room Capacity</p>
														<p className="text-muted-foreground text-sm">
															{discussion.dr_capacity}
														</p>
													</div>

													<div>
														<p className="text-sm">Description</p>
														<p className="text-muted-foreground text-sm line-clamp-3">
															{discussion.dr_description}
														</p>
													</div>

													<Button
														variant="link"
														size="sm"
														className="text-primary-custom hover:text-secondary-custom text-sm p-0"
													>
														View details
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}

							{viewType === "table" && (
								<Card className="bg-card border-border transition-colors duration-300 animate-slide-up">
									<CardContent className="p-0 overflow-x-auto">
										<table className="w-full">
											<thead className="bg-muted">
												<tr className="border-b border-border">
													{[
														"Cover",
														"Discussion Room",
														"Status",
														"Room Capacity",
														"Min & Max Duration",
														"Equipment",
														"Description",
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
												{discussionData.map((discussion, index) => (
													<tr
														key={index}
														className={`cursor-pointer border-b border-border hover:bg-accent/30 transition-colors ${
															index % 2 === 0 ? "bg-background" : "bg-muted/10"
														}`}
														onClick={() =>
															router.push(
																`/resources/discussion/details?id=${discussion.id}`,
															)
														}
													>
														<td className="py-4 px-6 text-center w-28  min-w-[180px] text-sm">
															<img
																src={
																	discussion.dr_photoURL || "/placeholder.svg"
																}
																alt="computer"
																className={`h-20 w-28 object-cover rounded-lg bg-gray-100 flex-shrink-0 `}
															/>
														</td>
														<td className="py-4 px-6 text-center text-foreground  font-medium  text-sm min-w-[250px]">
															{discussion.dr_name}
														</td>
														<td className="py-4 px-6 text-center min-w-[150px] text-sm">
															<Badge
																className={`${getStatusColor(
																	discussion.dr_status,
																)} text-sm`}
															>
																{discussion.dr_status}
															</Badge>
														</td>
														<td className="py-4 px-6 text-center text-foreground text-sm min-w-[150px]">
															{discussion.dr_capacity}
														</td>

														<td className="py-4 px-6 text-center text-foreground text-sm min-w-[250px]">
															{discussion.dr_minDurationFormatted} -{" "}
															{discussion.dr_maxDurationFormatted}
														</td>
														<td className="py-4 px-6 text-center text-foreground text-sm min-w-[150px]">
															{discussion.dr_equipment}
														</td>
														<td className="py-4 px-6 text-center text-foreground text-sm min-w-[350px]">
															<div className="line-clamp-3">
																{discussion.dr_description}{" "}
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</CardContent>
								</Card>
							)}

							<EmptyState data={discussionData} loading={loading} />

							<PaginationControls
								ctrPages={ctrPages}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</div>

						<ScannerModal
							isOpen={isScannerOpen}
							onClose={() => setIsScannerOpen(false)}
							setResult={setSearchQuery}
							allowedPrefix="DRM"
						/>
					</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
