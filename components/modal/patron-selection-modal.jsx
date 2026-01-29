"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Modal } from "./index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/tags/empty";
import { FiSearch, FiCamera } from "react-icons/fi";
import { Checkbox } from "@/components/ui/checkbox";

import { useLoading } from "@/contexts/LoadingProvider";
import { getPatronList } from "@/controller/firebase/get/getPatronList";
import { ScannerModal } from "@/components/modal/scanner-modal";

export function PatronSelectionModal({
	isOpen,
	onClose,
	resourceType,
	resourceID,
	libraryID,
	Alert,
}) {
	const router = useRouter();
	const [userData, setUserData] = useState([]);
	const { setLoading, setPath, loading } = useLoading();
	const pathname = usePathname();

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState("Student");
	const [selectedPatron, setSelectedPatron] = useState(null);
	const [isGuest, setIsGuest] = useState(false);

	useEffect(() => {
		setPath(pathname);

		if (isOpen && libraryID) {
			getPatronList(
				isGuest ? null : libraryID,
				setUserData,
				"Active",
				searchQuery,
				selectedType,
				setLoading,
				Alert,
			);
		}
	}, [libraryID, searchQuery, selectedType, isGuest, isOpen]);

	useEffect(() => {
		setSelectedPatron(null);
		setSearchQuery("");
		setSelectedType("Student");
	}, [isOpen]);

	const handleProceedWithReservation = () => {
		if (selectedPatron) {
			const queryParams = new URLSearchParams({
				type: resourceType,
				reID: resourceID,
				paID: selectedPatron.us_id,
			}).toString();

			router.push(`/resources/reserve?${queryParams}`);
		}
	};

	const handleClose = () => {
		onClose();
		setSelectedPatron(null);
		setSearchQuery("");
		setSelectedType("all");
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Select Patron for Reservation"
			size="xl"
		>
			<div className="p-6">
				<div className="mb-6 space-y-4">
					<div className="relative">
						<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							placeholder="Search by name, school ID, or email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-10 bg-card border-border text-foreground h-10"
						/>
						<FiCamera
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 cursor-pointer"
							onClick={() => setIsScannerOpen(true)}
							title="Scan QR / Barcode"
						/>
					</div>

					<div className="flex items-center gap-2 ">
						<Checkbox
							checked={isGuest}
							onCheckedChange={(e) => setIsGuest(!isGuest)}
						/>
						<label
							htmlFor="guest-checkbox"
							className="text-foreground text-sm mr-6"
						>
							Guest Patron
						</label>
					</div>
				</div>

				<div className="flex flex-wrap gap-2 mb-6">
					{["Student", "Student Assistant", "Faculty", "Administrator"].map(
						(type) => (
							<Button
								key={type}
								onClick={() => setSelectedType(type)}
								variant={selectedType === type ? "default" : "outline"}
								className={`h-9 px-4 text-sm ${
									selectedType === type
										? "bg-primary-custom text-white hover:bg-secondary-custom"
										: "border-border text-foreground hover:bg-muted"
								}`}
							>
								{type}
							</Button>
						),
					)}
				</div>

				<div className="flex items-center justify-between mb-4">
					<p className="text-primary text-xs">
						{userData?.length} patrons found
						{selectedPatron && ` • ${selectedPatron.us_name} selected`}
					</p>

					{selectedPatron && (
						<Button
							onClick={handleProceedWithReservation}
							className="bg-primary-custom hover:bg-secondary-custom text-white h-9 px-4 text-sm"
						>
							Proceed with Reservation
						</Button>
					)}
				</div>

				<div className="space-y-3 overflow-x-auto">
					<table className="w-full">
						<thead className="bg-muted/100">
							<tr className="border-b border-border">
								{[
									<Checkbox disabled={true} />,
									"Avatar",
									"School ID",
									"User Type",
									"Fullname",
									"Email",
									"Course",
									"Year",
									"Track/Institute",
									"Strand/Program",
									"Section",
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
							{userData?.map((patron, index) => (
								<tr
									key={index}
									className={`border-b border-border hover:bg-accent/30 transition-colors ${
										index % 2 === 0 ? "bg-background" : "bg-muted/10"
									}`}
									onClick={() => setSelectedPatron(patron)}
								>
									<td className="py-4 px-6 text-sm">
										<Checkbox
											checked={selectedPatron?.us_id === patron?.us_id}
										/>
									</td>
									<td className="py-4 px-6 flex text-sm">
										<img
											src={patron?.us_photoURL || "/placeholder.svg"}
											alt="avatar"
											className="w-12 h-12 rounded-full object-cover bg-gray-100 flex-shrink-0"
										/>
									</td>
									<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
										{patron?.us_schoolID}
									</td>
									<td className="py-4 px-6 min-w-[130px] text-sm text-foreground">
										<Badge className={getTypeColor(patron?.us_type)}>
											{patron?.us_type}
										</Badge>
									</td>
									<td className="py-4 px-6 min-w-[200px] text-sm text-foreground font-medium">
										{patron?.us_name}
									</td>

									<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
										{patron?.us_email}
									</td>
									<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
										{patron?.us_courses}
									</td>
									<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
										{patron?.us_year}
									</td>
									<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
										{patron?.us_tracks || patron?.us_institute}
									</td>
									<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
										{patron?.us_strand || patron?.us_program}
									</td>
									<td className="py-4 px-6 min-w-[150px] text-sm text-foreground">
										{patron?.us_section}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<EmptyState data={userData} loading={loading} />
				</div>
			</div>
			<ScannerModal
				isOpen={isScannerOpen}
				onClose={() => setIsScannerOpen(false)}
				setResult={setSearchQuery}
				allowedPrefix="USR"
			/>
		</Modal>
	);
}

const getTypeColor = (type) => {
	switch (type) {
		case "Student":
			return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
		case "Student Assistant":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
		case "Faculty":
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
		default:
			return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
	}
};
