"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiBell, FiMenu } from "react-icons/fi";
import { ScanLine } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useAlertActions } from "@/contexts/AlertContext";
import { ScannerModal } from "@/components/modal/scanner-modal";
import { useUserAuth } from "@/contexts/UserContextAuth";
import { getScanner } from "@/controller/firebase/get/getScanner";
import { getScannerCode } from "@/controller/firebase/get/getScannerCode";

export function Header({ setIsOpen: externalSetIsOpen }) {
	const { userDetails } = useUserAuth();
	const router = useRouter();
	const Alert = useAlertActions();

	//SCANNER
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [scannedCode, setScannedCode] = useState("");

	useEffect(() => {
		if (scannedCode) {
			getScanner(null, scannedCode, router, Alert);
		}
	}, [scannedCode]);

	useEffect(() => {
		if (!userDetails) return;

		const unsubscribe = getScannerCode(
			userDetails?.us_level == "USR-1",
			userDetails?.us_liID,
			userDetails?.uid,
			router,
			Alert,
		);

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [userDetails]);

	return (
		<div className="no-print fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-6 px-6 py-3 bg-card border-b border-border transition-all duration-300 opacity-100 max-w-screen-2xl mx-auto">
			<div className="flex items-center gap-2">
				<Button
					aria-label="Toggle sidebar"
					onClick={() => {
						if (externalSetIsOpen) {
							externalSetIsOpen((v) => !v);
						} else if (typeof window !== "undefined") {
							window.dispatchEvent(new CustomEvent("sidebar-toggle"));
						}
					}}
					variant="ghost"
					size="sm"
					className="md:hidden h-9 w-9 p-0 flex items-center justify-center"
				>
					<FiMenu className="w-5 h-5 text-foreground" />
				</Button>

				<div className="hidden md:flex items-center gap-2">
					<div className="h-14 rounded-lg overflow-hidden flex items-center justify-center ">
						<img
							src="/logo.png"
							alt="BETCH"
							className="w-full h-full object-cover"
						/>
					</div>
					<span className="font-semibold text-foreground text-lg select-none">
						Dalubhasaang Politekniko ng Lungsod ng Baliwag
					</span>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Button
					onClick={() => setIsScannerOpen(true)}
					variant="ghost"
					size="sm"
					className="relative h-9 w-9 p-0 flex items-center justify-center overflow-hidden"
				>
					<ScanLine className="w-14 h-14 text-foreground" />
					<span className="absolute left-2 right-2 h-[2px] bg-primary animate-scan" />
				</Button>

				<div
					className="flex items-center gap-2 cursor-pointer"
					onClick={() => router.push(`/account/details?id=${userDetails?.uid}`)}
				>
					<Avatar className="w-9 h-9">
						<AvatarImage
							src={userDetails?.us_photoURL || "/placeholder.svg"}
							alt="User Photo"
							className="object-cover"
						/>
						<AvatarFallback>
							{(userDetails?.us_fname?.[0] || "") +
								(userDetails?.us_lname?.[0] || "")}
						</AvatarFallback>
					</Avatar>

					<div className="sm:block hidden">
						<p className="font-medium text-foreground text-base">
							{userDetails?.us_fname || ""} {userDetails?.us_lname || ""}
						</p>
						<p className="text-muted-foreground text-sm">
							{userDetails?.us_type || ""} | {userDetails?.us_level || ""}
						</p>
					</div>
				</div>
			</div>

			<ScannerModal
				isOpen={isScannerOpen}
				onClose={() => setIsScannerOpen(false)}
				setResult={setScannedCode}
				allowedPrefix="TRN|USR|MTL|CMP|DRM|LIB"
			/>
		</div>
	);
}
