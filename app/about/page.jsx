"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	FiClock,
	FiInfo,
	FiSettings,
	FiBook,
	FiUsers,
	FiMonitor,
	FiPhone,
	FiMapPin,
} from "react-icons/fi";

import {
	ConfirmationModal,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Switch,
} from "@/components/modal/confirmation-modal";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";
import { LoadingSpinner } from "@/components/loading";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { getLibrary } from "@/controller/firebase/get/getLibrary";
import {
	updateResources,
	updateOperating,
} from "@/controller/firebase/update/updateResourcesOperating";

export default function About() {
	const { userDetails } = useUserAuth();
	const pathname = usePathname();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();
	const [btnLoading, setBtnLoading] = useState(false);

	const [libraryData, setLibraryData] = useState({});
	const [openHours, setOpenHours] = useState({
		oh_monday: {
			enabled: false,
			open: "00:00",
			close: "00:00",
		},
		oh_tuesday: {
			enabled: false,
			open: "00:00",
			close: "00:00",
		},
		oh_wednesday: {
			enabled: false,
			open: "00:00",
			close: "00:00",
		},
		oh_thursday: {
			enabled: false,
			open: "00:00",
			close: "00:00",
		},
		oh_friday: {
			enabled: false,
			open: "00:00",
			close: "00:00",
		},
		oh_saturday: {
			enabled: false,
			open: "00:00",
			close: "00:00",
		},
	});

	const [setToAllHours, setSetToAllHours] = useState({
		open: "07:00",
		close: "21:00",
	});

	const daysOfWeek = [
		{ key: "oh_monday", label: "Monday" },
		{ key: "oh_tuesday", label: "Tuesday" },
		{ key: "oh_wednesday", label: "Wednesday" },
		{ key: "oh_thursday", label: "Thursday" },
		{ key: "oh_friday", label: "Friday" },
		{ key: "oh_saturday", label: "Saturday" },
	];

	const [resourceSettings, setResourceSettings] = useState({
		material: false,
		discussion: false,
		computer: false,
	});

	//LEVEL
	const [isPersonnel, setIsPersonnel] = useState(false);

	const handleOpenHoursChange = (day, field, value) => {
		setOpenHours((prev) => ({
			...prev,
			[day]: { ...prev[day], [field]: value },
		}));
	};

	const handleSetToAllChange = (field, value) => {
		setSetToAllHours((prev) => ({ ...prev, [field]: value }));
	};

	const applyToAllDays = () => {
		const updatedHours = {};
		Object.keys(openHours).forEach((day) => {
			updatedHours[day] = {
				...openHours[day],
				open: setToAllHours.open,
				close: setToAllHours.close,
			};
		});
		setOpenHours(updatedHours);
	};

	const handleSave = async () => {
		if (userDetails && userDetails?.us_liID) {
			await updateOperating(
				userDetails?.us_liID,
				userDetails?.uid,
				libraryData?.li_name,
				openHours,
				setBtnLoading,
				Alert
			);
		}
	};

	const resourceItems = [
		{
			key: "material",
			name: "Material Resources",
			description: "Books, journals, magazines, and other physical materials",
			icon: FiBook,
			enabled: resourceSettings.material,
			colors: {
				enabled: { bg: "bg-blue-100", text: "text-blue-600" },
				disabled: { bg: "bg-gray-100", text: "text-gray-400" },
			},
		},
		{
			key: "discussion",
			name: "Discussion Resources",
			description: "Discussion rooms and collaborative spaces",
			icon: FiUsers,
			enabled: resourceSettings.discussion,
			colors: {
				enabled: { bg: "bg-purple-100", text: "text-purple-600" },
				disabled: { bg: "bg-gray-100", text: "text-gray-400" },
			},
		},
		{
			key: "computer",
			name: "Computer Resources",
			description: "Computer workstations and digital resources",
			icon: FiMonitor,
			enabled: resourceSettings.computer,
			colors: {
				enabled: { bg: "bg-orange-100", text: "text-orange-600" },
				disabled: { bg: "bg-gray-100", text: "text-gray-400" },
			},
		},
	];

	const [confirmationModal, setConfirmationModal] = useState({
		isOpen: false,
		title: "",
		subtitle: "",
		confirmText: "",
		cancelText: "",
		variant: "default",
		onConfirm: null,
	});

	const showConfirmation = ({
		title,
		subtitle,
		confirmText,
		cancelText,
		variant,
	}) => {
		return new Promise((resolve) => {
			setConfirmationModal({
				isOpen: true,
				title,
				subtitle,
				confirmText,
				cancelText,
				variant,
				onConfirm: resolve,
			});
		});
	};

	const handleConfirmationClose = () => {
		setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
		if (confirmationModal.onConfirm) {
			confirmationModal.onConfirm(false);
		}
	};

	const handleConfirmationConfirm = () => {
		setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
		if (confirmationModal.onConfirm) {
			confirmationModal.onConfirm(true);
		}
	};

	const handleResourceToggle = async (
		resourceKey,
		resourceName,
		currentStatus
	) => {
		const action = currentStatus ? "deactivate" : "activate";
		const title = `${
			action === "activate" ? "Activate" : "Deactivate"
		} ${resourceName}`;

		let subtitle = `Are you sure you want to ${action} ${resourceName}?`;
		if (action === "deactivate") {
			subtitle +=
				" All related reservations will be cancelled and users will no longer be able to access this resource.";
		}

		const confirmed = await showConfirmation({
			title,
			subtitle,
			confirmText: action === "activate" ? "Activate" : "Deactivate",
			cancelText: "Cancel",
			variant: action === "deactivate" ? "danger" : "default",
		});

		if (confirmed) {
			const newSettings = {
				...resourceSettings,
				[resourceKey]: !currentStatus,
			};

			setResourceSettings(newSettings);

			if (userDetails && userDetails?.us_liID) {
				await updateResources(
					userDetails?.us_liID,
					userDetails?.uid,
					libraryData?.li_name,
					resourceName,
					newSettings,
					setBtnLoading,
					Alert
				);
			}
		}
	};

	useEffect(() => {
		setIsPersonnel(
			!["USR-1", "USR-5", "USR-6"].includes(userDetails?.us_level)
				? true
				: false
		);
	}, [userDetails]);

	useEffect(() => {
		if (!userDetails || !userDetails?.us_liID) return;
		setPath(pathname);
		const unsubscribe = getLibrary(
			userDetails?.us_liID,
			setLibraryData,
			setLoading,
			Alert,
			setResourceSettings,
			setOpenHours
		);
		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [userDetails]);

	return (
		<div className="flex h-screen bg-background transition-colors duration-300">
			<Sidebar />

			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />

				<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
					<div className="mb-8 animate-fade-in">
						<h1 className="font-semibold text-foreground text-xl">
							About & Settings
						</h1>
						<p className="text-muted-foreground text-base">
							Library information, resource settings, and operational
							configuration
						</p>
					</div>
					<div className="mb-8 animate-slide-up">
						<div className="relative h-64 rounded-lg overflow-hidden mb-6">
							<img
								src={libraryData?.li_photoURL || "/placeholder.jpg"}
								alt="Library"
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-black/50"></div>
							<div className="absolute top-6 left-6">
								<h2 className="font-semibold text-white text-lg">
									{libraryData?.li_name || ""}
								</h2>
								<p className="text-white text-base">
									{libraryData?.li_schoolname || ""}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
							<Card className="bg-card border-border transition-colors duration-300">
								<CardHeader className="!pb-4">
									<CardTitle className="flex items-center gap-2 text-foreground text-base">
										<FiInfo className="w-4 h-4" />
										Basic Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-foreground text-sm">School ID</p>
										<p className="text-muted-foreground font-medium break-words text-sm">
											{libraryData?.li_schoolID}
										</p>
									</div>
									<div>
										<p className="text-foreground text-sm">Description</p>
										<p className="text-muted-foreground break-words text-sm">
											{libraryData?.li_description}
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border transition-colors duration-300">
								<CardHeader className="!pb-4">
									<CardTitle className="flex items-center gap-2 text-foreground text-base">
										<FiPhone className="w-4 h-4" />
										Contact Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-foreground text-sm">Phone</p>
										<p className="text-muted-foreground  break-words text-sm">
											{libraryData?.li_phone}
										</p>
									</div>
									<div>
										<p className="text-foreground text-sm">Email</p>
										<p className="text-muted-foreground  break-words text-sm">
											{libraryData?.li_email}
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border transition-colors duration-300">
								<CardHeader className="!pb-4">
									<CardTitle className="flex items-center gap-2 text-foreground text-base">
										<FiMapPin className="w-4 h-4" />
										Address
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div>
										<p className="text-foreground text-sm">
											{libraryData?.li_address}
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="bg-card border-border transition-colors duration-300 animate-slide-up-delay-1">
							<CardHeader className="!pb-4">
								<CardTitle className="flex items-center gap-2 text-foreground text-base">
									<FiClock className="w-4 h-4" />
									Operating Hours
								</CardTitle>
								<p className="text-muted-foreground text-sm">
									Configure library operating hours for each day
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								{isPersonnel && (
									<div className="p-4 border border-border rounded-lg bg-muted/30">
										<h4 className="font-medium text-foreground mb-4 text-sm">
											Apply to All Days
										</h4>
										<div className="space-y-3">
											<div className="grid grid-cols-2 gap-2">
												<div>
													<label className="block text-foreground font-medium mb-2 text-sm">
														Open Time
													</label>
													<Input
														type="time"
														value={setToAllHours.open}
														onChange={(e) =>
															handleSetToAllChange("open", e.target.value)
														}
														className="bg-card border-border text-foreground h-9"
														
													/>
												</div>
												<div>
													<label className="block text-foreground font-medium mb-2  text-sm">
														Close Time
													</label>
													<Input
														type="time"
														value={setToAllHours.close}
														onChange={(e) =>
															handleSetToAllChange("close", e.target.value)
														}
														className="bg-card border-border text-foreground h-9 "
														
													/>
												</div>
											</div>
											<div className="flex gap-2">
												<Button
													onClick={applyToAllDays}
													variant="outline"
													className="flex-1 h-9 border border-border text-primary-custom bg-transparent hover:bg-transparent text-sm"
												>
													Apply to All Days
												</Button>
												<Button
													onClick={handleSave}
													className="bg-primary-custom hover:bg-secondary-custom text-white h-9 w-[100px] text-sm"
												>
													<LoadingSpinner loading={btnLoading} />
													Save
												</Button>
											</div>
										</div>
									</div>
								)}

								<div className="space-y-4">
									<h4 className="font-medium text-foreground text-sm">
										Individual Day Settings
									</h4>
									{daysOfWeek.map((day) => (
										<div key={day.key} className="space-y-2">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<label className="text-foreground font-medium text-sm">
														{day.label}
													</label>
													<div
														className={`ml-2 text-sm ${
															openHours[day.key].enabled
																? "text-muted-foreground"
																: "text-red-500"
														}`}
													>
														{openHours[day.key].enabled ? "" : "Closed"}
													</div>
												</div>
												{isPersonnel && (
													<Switch
														checked={openHours[day.key].enabled}
														onCheckedChange={(checked) =>
															handleOpenHoursChange(day.key, "enabled", checked)
														}
													/>
												)}
											</div>
											{openHours[day.key].enabled && (
												<div className="grid grid-cols-2 gap-2">
													<Input
														type="time"
														value={openHours[day.key].open}
														onChange={(e) =>
															handleOpenHoursChange(
																day.key,
																"open",
																e.target.value
															)
														}
														readOnly={!openHours[day.key].enabled}
														className={`border-border text-foreground h-9 ${
															!openHours[day.key].enabled
																? "bg-muted cursor-not-allowed"
																: "bg-card"
														}`}
														
													/>
													<Input
														type="time"
														value={openHours[day.key].close}
														onChange={(e) =>
															handleOpenHoursChange(
																day.key,
																"close",
																e.target.value
															)
														}
														readOnly={!openHours[day.key].enabled}
														className={`border-border text-foreground h-9 ${
															!openHours[day.key].enabled
																? "bg-muted cursor-not-allowed"
																: "bg-card"
														}`}
														
													/>
												</div>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="bg-card border-border h-fit transition-colors duration-300 animate-slide-up-delay-2">
							<CardHeader className="!pb-4">
								<CardTitle className="flex items-center gap-2 text-foreground text-base">
									<FiSettings className="w-4 h-4" />
									Resource Settings
								</CardTitle>
								<p className="text-muted-foreground text-sm">
									Enable or disable library resources and services
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									{resourceItems.map((resource) => {
										const IconComponent = resource.icon;
										return (
											<div key={resource.key} className="space-y-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3">
														<div
															className={`p-2 rounded-lg ${
																resource.enabled
																	? `${resource.colors.enabled.bg} ${resource.colors.enabled.text}`
																	: `${resource.colors.disabled.bg} ${resource.colors.disabled.text}`
															}`}
														>
															<IconComponent className="w-4 h-4" />
														</div>
														<div>
															<p className="font-medium text-foreground text-sm">
																{resource.name}
															</p>
															<p className="text-muted-foreground text-sm">
																{resource.description}
															</p>
														</div>
													</div>

													{isPersonnel && (
														<Switch
															checked={resource.enabled}
															onCheckedChange={() =>
																handleResourceToggle(
																	resource.key,
																	resource.name,
																	resource.enabled
																)
															}
														/>
													)}
												</div>
											</div>
										);
									})}
								</div>

								<div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
									<h4 className="font-medium text-foreground text-sm mb-2">
										Resource Status Summary
									</h4>
									<div className="grid grid-cols-1 gap-1">
										<div className="flex justify-between items-center">
											<span className="text-muted-foreground text-sm">
												Active Resources:
											</span>
											<span className="font-medium text-foreground text-sm">
												{Object.values(resourceSettings).filter(Boolean).length}{" "}
												of {Object.keys(resourceSettings).length}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-muted-foreground text-sm">
												System Status:
											</span>
											<span
												className={`font-medium text-sm ${
													Object.values(resourceSettings).some(Boolean)
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												{Object.values(resourceSettings).some(Boolean)
													? "Operational"
													: "Limited"}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</main>

				<ConfirmationModal
					isOpen={confirmationModal.isOpen}
					onClose={handleConfirmationClose}
					onConfirm={handleConfirmationConfirm}
					title={confirmationModal.title}
					subtitle={confirmationModal.subtitle}
					confirmText={confirmationModal.confirmText}
					cancelText={confirmationModal.cancelText}
					variant={confirmationModal.variant}
				/>
			</div>
		</div>
	);
}
