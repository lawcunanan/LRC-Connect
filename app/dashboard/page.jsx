"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiBook, FiUsers, FiClock, FiSearch } from "react-icons/fi";

import EmptyState from "@/components/tags/empty";
import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";
import PaginationControls from "@/components/tags/pagination";

import { getDashboardStats } from "@/controller/firebase/get/getDashboardStats";
import { getAuditFilterData } from "@/controller/firebase/get/getAudittrail";
import { getFeedbackList } from "@/controller/firebase/get/getFeedbackList";
import { updateFeedbackRead } from "@/controller/firebase/update/updateFeedback";

export default function Dashboard() {
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [statistics, setStatistics] = useState({
		activeLibraries: 0,
		inactiveLibraries: 0,
		activeAccounts: 0,
		inactiveAccounts: 0,
		todayAuditTrails: 0,
		lastUpdate: 0,
	});
	const [libraries, setLibraries] = useState([]);
	const [feedbackData, setFeedbackData] = useState([]);

	//FILTERS
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLibrary, setSelectedLibrary] = useState("All");
	const [selectedStatus, setSelectedStatus] = useState("All");

	//PAGINATION
	const pageLimit = 5;
	const [pagination, setPagination] = useState({
		feedback: {
			currentPage: 1,
			pageCursors: [],
			ctrPages: 1,
		},
	});

	const handleCheckboxChange = async (id, type, checked) => {
		if (!userDetails?.uid && selectedLibrary == "All") return;
		await updateFeedbackRead(
			id,
			selectedLibrary,
			type,
			checked,
			userDetails?.uid,
			Alert,
		);
	};

	useEffect(() => {
		let unsubscribe;
		const fetchData = async () => {
			unsubscribe = await getDashboardStats(setStatistics, Alert);
		};

		fetchData();

		return () => {
			if (typeof unsubscribe === "function") {
				unsubscribe();
			}
		};
	}, []);

	useEffect(() => {
		setPath(pathname);
		let unsubscribe;

		if (selectedLibrary !== "All" || selectedStatus !== "All") {
			unsubscribe = getFeedbackList(
				selectedLibrary,
				setFeedbackData,
				searchQuery,
				selectedStatus,
				setLoading,
				Alert,
				pageLimit,
				pagination,
				setPagination,
			);
		}

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [
		selectedLibrary,
		selectedStatus,
		searchQuery,
		pagination.feedback?.currentPage,
	]);

	useEffect(() => {
		getAuditFilterData(setLibraries, Alert);
	}, []);

	useEffect(() => {
		if (libraries && libraries[0]?.id) {
			setSelectedLibrary(libraries[0]?.id);
		}
	}, [libraries]);

	return (
		<ProtectedRoute allowedRoles={["USR-1"]}>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />

				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 ">
						<div className="mb-8 animate-fade-in">
							<h1 className="font-semibold text-foreground text-2xl mb-1">
								Dashboard
							</h1>
							<p className="text-muted-foreground text-base">
								Overview of library system statistics and key metrics
							</p>
						</div>

						<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-14 animate-slide-up">
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-2">
										<p className="text-muted-foreground text-">
											Active Libraries
										</p>
										<FiBook className="w-4 h-4" />
									</div>
									<p className="font-bold 00 text-2xl">
										{statistics.activeLibraries}
									</p>
								</CardContent>
							</Card>

							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-2">
										<p className="text-muted-foreground text-sm">
											Inactive Libraries
										</p>
										<FiBook className="w-4 h-4 " />
									</div>
									<p className="font-bold  text-2xl">
										{statistics.inactiveLibraries}
									</p>
								</CardContent>
							</Card>

							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-2">
										<p className="text-muted-foreground text-sm">
											Active Accounts
										</p>
										<FiUsers className="w-4 h-4 " />
									</div>
									<p className="font-bold text-2xl">
										{statistics.activeAccounts}
									</p>
								</CardContent>
							</Card>

							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-2">
										<p className="text-muted-foreground text-sm">
											Inactive Accounts
										</p>
										<FiUsers className="w-4 h-4" />
									</div>
									<p className="font-bold text-2xl">
										{statistics.inactiveAccounts}
									</p>
								</CardContent>
							</Card>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-14 animate-slide-up-delay-1">
							<div className="lg:col-span-2">
								<Card className="bg-card border-border transition-colors duration-300 max-h-[1200px] flex flex-col">
									<CardContent className="p-6 flex flex-col overflow-hidden">
										<div className="flex-shrink-0 mb-4">
											<h3 className="text-foreground font-semibold text-xl">
												Feedback Management
											</h3>

											<p className="text-muted-foreground mb-4 text-sm">
												Review and manage feedback submitted by users across all
												libraries
											</p>

											<div className="flex flex-col md:flex-row gap-3 mb-6">
												<div className="relative flex-1">
													<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
													<Input
														type="text"
														placeholder="Search feedback..."
														value={searchQuery}
														onChange={(e) => setSearchQuery(e.target.value)}
														className="pl-10 pr-4 h-9 bg-background border text-foreground rounded-md shadow-sm text-sm"
													/>
												</div>

												<div className="flex items-center gap-4">
													<Select
														value={selectedLibrary}
														onValueChange={setSelectedLibrary}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select library" />
														</SelectTrigger>
														<SelectContent>
															{libraries.map((library) => (
																<SelectItem key={library.id} value={library.id}>
																	{library.li_name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>

													<Select
														value={selectedStatus}
														onValueChange={setSelectedStatus}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select status" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="All">All Status</SelectItem>
															<SelectItem value="unread">Unread</SelectItem>
															<SelectItem value="read">Read</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>

										<div className="flex-1 overflow-y-auto space-y-4">
											{feedbackData?.map((feedback) => (
												<div
													key={feedback?.id}
													className={`flex items-start gap-4 p-4 rounded-lg border ${
														feedback?.fe_isRead
															? "bg-muted/20 border-border"
															: "bg-card border-primary/20 shadow-sm"
													} hover:border-primary/50 transition-colors`}
												>
													<Checkbox
														id={`feedback-${feedback?.id}`}
														checked={feedback?.fe_isRead}
														onCheckedChange={(checked) =>
															handleCheckboxChange(
																feedback?.id,
																feedback?.fe_type,
																feedback?.fe_isRead,
															)
														}
														className="mt-1"
														title="Mark as read"
													/>

													<Avatar className="h-10 w-10">
														<AvatarImage
															src={feedback?.fe_avatar || "/placeholder.svg"}
															alt={feedback?.fe_sender}
														/>
														<AvatarFallback>
															{feedback?.fe_sender.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 space-y-2">
														<div className="flex items-start justify-between ">
															<div>
																<p className="text-foreground font-medium text-base">
																	{feedback?.fe_sender}
																</p>

																<p className="text-primary-custom text-sm">
																	{feedback?.fe_ustype}
																	<span className="text-muted-foreground">
																		{" • "}
																		{feedback?.fe_schoolID}
																	</span>
																</p>
															</div>
															<span className="text-muted-foreground text-xs">
																{feedback?.fe_createdAtFormatted}
															</span>
														</div>

														<span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
															{feedback?.fe_type}
														</span>

														<p className="text-foreground text-sm">
															{feedback?.fe_content}
														</p>

														{feedback?.fe_screenshot && (
															<div>
																<p className="text-muted-foreground font-medium mt-4 mb-2 text-sm">
																	Screenshot:
																</p>
																<img
																	src={
																		feedback?.fe_screenshot ||
																		"/placeholder.svg"
																	}
																	alt="Feedback screenshot"
																	className="w-full max-h-40 object-cover rounded-md border border-border"
																/>
															</div>
														)}
													</div>
												</div>
											))}

											<EmptyState data={feedbackData} loading={loading} />
										</div>

										<PaginationControls
											ctrPages={pagination.feedback?.ctrPages}
											currentPage={pagination.feedback?.currentPage}
											setCurrentPage={(val) =>
												setPagination((prev) => ({
													...prev,
													feedback: {
														...prev.feedback,
														currentPage:
															typeof val === "function"
																? val(prev.feedback?.currentPage)
																: val,
													},
												}))
											}
										/>
									</CardContent>
								</Card>
							</div>

							<div className="lg:col-span-1">
								<Card className="bg-card border-border transition-colors duration-300 h-fit">
									<CardContent className="p-6 flex flex-col items-center justify-center text-center">
										<h3 className="text-foreground font-semibold text-xl">
											Today's Audits
										</h3>
										<p className="text-muted-foreground mb-6 text-sm">
											Total audit trail entries recorded today
										</p>

										<div className="mb-6">
											<div className="w-32 h-32 rounded-full flex items-center justify-center border-2 border-primary">
												<p className="font-bold text-4xl">
													{statistics.todayAuditTrails}
												</p>
											</div>
										</div>

										<div className="w-full pt-6 border-t border-border">
											<div className="flex items-center justify-center gap-2 mb-1">
												<FiClock className="w-5 h-5 text-muted-foreground" />
												<h4 className="font-semibold text-foreground text-base">
													Last Update
												</h4>
											</div>
											<p className="text-muted-foreground mb-4 text-sm">
												Most recent system activity
											</p>
											<p className="text-white bg-primary rounded-lg px-4 py-2 inline-block text-sm">
												{statistics.lastUpdate}
											</p>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
