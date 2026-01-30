"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiMail, FiLock } from "react-icons/fi";

import { useRouter } from "next/navigation";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";
import { handleLogin } from "@/controller/auth/login";

export default function LoginPage() {
	const router = useRouter();
	const Alert = useAlertActions();
	const { setHasTriggered } = useUserAuth();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});

	const [btnLoading, setBtnlaoding] = useState(false);

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		handleLogin(formData, setBtnlaoding, Alert, setHasTriggered);
		setFormData({ email: "", password: "" });
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center duration-300">
			<main className="p-6 w-full max-w-[380px]">
				<Card className="overflow-hidden border-0 shadow-none">
					<CardContent className="p-0 flex items-center justify-center">
						<div className="flex items-center justify-center w-full max-w-[380px] p-0">
							<div className="w-full">
								<div className="text-center mb-8">
									<h1 className=" text-2xl font-bold text-foreground">
										Welcome back
									</h1>
									<p className="text-muted-foreground text-base">
										Please enter your details to sign in
									</p>
								</div>

								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<Label
											htmlFor="email"
											className="text-sm font-medium text-foreground "
										>
											Email
										</Label>
										<div className="relative">
											<FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
											<Input
												id="email"
												type="email"
												placeholder="Enter your email"
												value={formData?.email}
												onChange={(e) =>
													handleInputChange("email", e.target.value)
												}
												className="pl-10 pr-5 h-11 border-border focus:border-primary-custom text-sm"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="password"
											className="text-sm font-medium text-foreground"
										>
											Password
										</Label>
										<div className="relative">
											<FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
											<Input
												id="password"
												type="password"
												placeholder="Enter your password"
												value={formData?.password}
												onChange={(e) =>
													handleInputChange("password", e.target.value)
												}
												className="pl-10 pr-5 h-11 border-border focus:border-primary-custom text-sm"
											/>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full h-11 text-white  bg-primary-custom hover:bg-secondary-custom transition-colors  text-sm"
									>
										<LoadingSpinner loading={btnLoading} />
										Sign In
									</Button>
								</form>
							</div>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
