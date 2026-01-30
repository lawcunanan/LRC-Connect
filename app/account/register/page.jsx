"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FiImage, FiArrowLeft, FiUpload } from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";

import { handleChange } from "../../../controller/custom/customFunction";
import { LoadingSpinner } from "@/components/loading";

import { insertUser } from "@/controller/firebase/insert/insertUser";
import {
	fetchProvinces,
	fetchCitiesOrMunicipalities,
	fetchBarangays,
} from "@/controller/custom/address";

import { getFilterCourses } from "@/controller/firebase/get/getCourses";
import { getFilterTrackInstituteCourses } from "@/controller/firebase/get/getCourses";

const defaultValue = {
	us_type: "",
	us_schoolID: "",
	us_status: "Active",
	us_fname: "",
	us_mname: "",
	us_lname: "",
	us_suffix: "",
	us_sex: "",
	us_birthday: "",
	us_email: "",
	us_phoneNumber: "",
	us_street: "",
	us_barangay: "",
	us_municipal: "",
	us_province: "",

	us_courses: "",
	us_year: "",
	us_tracks: "",
	us_strand: "",
	us_institute: "",
	us_program: "",
	us_section: "",
	us_photoURL: "",
};

export default function RegisterAccount() {
	const { userDetails } = useUserAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");
	const type = searchParams.get("type");

	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);
	const [formData, setFormData] = useState(defaultValue);

	//ACADEMIC
	const [selectedCourseID, setSelectedCourseID] = useState("");
	const [filterCoursesData, setFilterCoursesData] = useState([]);
	const [subCoursesData, setSubCoursesData] = useState([]);

	const [provinces, setProvinces] = useState([]);
	const [municipals, setMunicipals] = useState([]);
	const [barangays, setBarangays] = useState([]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!id || !userDetails?.uid || !type) return;
		await insertUser(id, userDetails?.uid, formData, setBtnLoading, Alert);
		setFormData(defaultValue);
	};

	const handleCancel = () => {
		router.back();
	};

	//FETCH COURSES
	useEffect(() => {
		if (!formData?.us_courses) return;
		getFilterCourses(formData?.us_courses, setFilterCoursesData, Alert);
	}, [formData?.us_courses]);

	useEffect(() => {
		if (selectedCourseID) {
			getFilterTrackInstituteCourses(
				selectedCourseID,
				filterCoursesData,
				setSubCoursesData,
				Alert,
			);
		} else {
			setSubCoursesData([]);
		}
	}, [selectedCourseID, filterCoursesData]);

	//FETCH ADDRESS
	useEffect(() => {
		fetchProvinces(setProvinces);
	}, [id]);

	useEffect(() => {
		if (formData?.us_province) {
			const provinceCode = formData?.us_province.split("|")[0];
			fetchCitiesOrMunicipalities(provinceCode, setMunicipals);
			setFormData((prev) => ({
				...prev,
				us_municipal: "",
				us_barangay: "",
			}));
		}
	}, [formData?.us_province]);

	useEffect(() => {
		if (formData?.us_municipal) {
			const municipalCode = formData?.us_municipal.split("|")[0];
			fetchBarangays(municipalCode).then((barangayList) => {
				setBarangays(barangayList);
				setFormData((prev) => ({
					...prev,
					us_barangay: "",
				}));
			});
		}
	}, [formData?.us_municipal]);

	return (
		<ProtectedRoute allowedRoles={["USR-1"]}>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />
				<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<div className="mb-6 animate-fade-in">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-sm"
						>
							<FiArrowLeft className="w-4 h-4" />
							Back to Previous page
						</button>
					</div>

					<div className="mb-8 animate-slide-up">
						<h1 className="font-semibold text-foreground text-2xl mb-1">
							Register Account
						</h1>
						<p className="text-muted-foreground text-base">
							Add a new user account to the system with complete personal
							information
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-slide-up-delay-1">
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<h3 className="text-foreground font-semibold text-xl mb-1">
										Account Information
									</h3>
									<p className="text-muted-foreground text-sm mb-4">
										Complete the form below to add a new user account.
									</p>

									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-foreground font-medium mb-2 text-sm">
													User Type
												</label>
												<Select
													name="us_type"
													value={formData?.us_type || ""}
													onValueChange={(value) =>
														setFormData((prev) => ({ ...prev, us_type: value }))
													}
													required
												>
													<SelectTrigger className="w-full h-9">
														<SelectValue placeholder="Select User Type" />
													</SelectTrigger>
													<SelectContent>
														{type && type === "patron" && (
															<>
																<SelectItem value="Student">Student</SelectItem>
																<SelectItem value="Faculty">Faculty</SelectItem>
																<SelectItem value="Administrator">
																	Administrator
																</SelectItem>
															</>
														)}
														{type && type === "personnel" && (
															<>
																<SelectItem value="Student Assistant">
																	Student Assistant
																</SelectItem>
																<SelectItem value="Administrative Assistant">
																	Administrative Assistant
																</SelectItem>
																<SelectItem value="Chief Librarian">
																	Chief Librarian
																</SelectItem>
																<SelectItem value="Head Librarian">
																	Head Librarian
																</SelectItem>
															</>
														)}
													</SelectContent>
												</Select>
											</div>
											<div>
												<label className="block text-foreground font-medium mb-2 text-sm">
													School ID
												</label>
												<Input
													name="us_schoolID"
													value={formData?.us_schoolID || ""}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="Enter school ID"
													className="bg-card border-border text-foreground h-9"
													required
												/>
											</div>
										</div>

										<div>
											<label className="block text-foreground font-medium mb-2 text-sm">
												First name
											</label>
											<Input
												name="us_fname"
												value={formData?.us_fname || ""}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="Enter your first name"
												className="bg-card border-border text-foreground h-9"
												required
											/>
										</div>

										<div>
											<label className="block text-foreground font-medium mb-2 text-sm">
												Middle name
											</label>
											<Input
												name="us_mname"
												value={formData?.us_mname || ""}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="Enter your middle name"
												className="bg-card border-border text-foreground h-9"
											/>
										</div>

										<div>
											<label className="block text-foreground font-medium mb-2 text-sm">
												Last name
											</label>
											<Input
												name="us_lname"
												value={formData?.us_lname || ""}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="Enter your last name"
												className="bg-card border-border text-foreground h-9"
												required
											/>
										</div>

										<div>
											<label className="block text-foreground font-medium mb-2 text-sm">
												Suffix
											</label>
											<Input
												name="us_suffix"
												value={formData?.us_suffix || ""}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="Jr., Sr., III (optional)"
												className="bg-card border-border text-foreground h-9"
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-foreground font-medium mb-2 text-sm">
													Sex
												</label>
												<Select
													name="us_sex"
													value={formData?.us_sex || ""}
													onValueChange={(value) =>
														setFormData((prev) => ({ ...prev, us_sex: value }))
													}
													required
												>
													<SelectTrigger className="w-full h-9">
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="Male">Male</SelectItem>
														<SelectItem value="Female">Female</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div>
												<label className="block text-foreground font-medium mb-2 text-sm">
													Birthday
												</label>
												<Input
													name="us_birthday"
													type="date"
													value={formData?.us_birthday || ""}
													onChange={(e) => handleChange(e, setFormData)}
													className="bg-card border-border text-foreground h-9"
													required
													max={
														new Date(
															new Date().setFullYear(
																new Date().getFullYear() - 16,
															),
														)
															.toISOString()
															.split("T")[0]
													}
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-4 ">
											<div>
												<label className="block text-foreground font-medium mb-2 text-sm">
													Phone Number
												</label>
												<Input
													name="us_phoneNumber"
													value={formData?.us_phoneNumber || ""}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="+639xxxxxxxxx"
													className="bg-card border-border text-foreground h-9"
													pattern="^\+639\d{9}$"
													title="Enter a valid Philippine mobile number (e.g., +639123456789)"
												/>
											</div>
											<div>
												<label className="block text-foreground font-medium mb-2 text-sm">
													Email
												</label>
												<Input
													name="us_email"
													type="email"
													value={formData?.us_email || ""}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="@gmail.com"
													className="bg-card border-border text-foreground h-9"
													required
												/>
											</div>
										</div>

										{type && type == "patron" && (
											<div className="pt-8">
												<h3 className="text-foreground font-semibold text-xl mb-1">
													Academic
												</h3>
												<p className="text-muted-foreground text-sm mb-4">
													Provide province, municipality, and barangay for
													accurate location data.
												</p>

												<div className="space-y-4">
													<div className="grid grid-cols-2 gap-4">
														<div>
															<label className="block text-foreground font-medium mb-2 text-sm">
																Courses
															</label>
															<Select
																name="us_courses"
																value={formData?.us_courses}
																onValueChange={(value) =>
																	setFormData((prev) => ({
																		...prev,
																		us_courses: value,
																	}))
																}
																required
															>
																<SelectTrigger className="w-full h-9">
																	<SelectValue placeholder="Select Courses" />
																</SelectTrigger>
																<SelectContent>
																	{[
																		"Senior High School",
																		"College Courses",
																	].map((courses) => (
																		<SelectItem key={courses} value={courses}>
																			{courses}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</div>
														<div>
															<label className="block text-foreground font-medium mb-2 text-sm">
																Year
															</label>
															<Select
																name="us_year"
																value={formData?.us_year}
																onValueChange={(value) =>
																	setFormData((prev) => ({
																		...prev,
																		us_year: value,
																	}))
																}
																required
															>
																<SelectTrigger className="w-full h-9">
																	<SelectValue placeholder="Select Year" />
																</SelectTrigger>
																<SelectContent>
																	{(formData?.us_courses ===
																	"Senior High School"
																		? ["Grade 11", "Grade 12"]
																		: [
																				"1st Year",
																				"2nd Year",
																				"3rd Year",
																				"4th Year",
																			]
																	).map((ye, index) => (
																		<SelectItem key={index} value={ye}>
																			{ye}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</div>
													</div>

													{formData?.us_courses && (
														<div className="grid grid-cols-2 gap-4">
															<div>
																<label className="block text-foreground font-medium mb-2 text-sm">
																	{formData.us_courses === "Senior High School"
																		? "Tracks"
																		: "Institute"}
																</label>
																<Select
																	value={selectedCourseID || ""}
																	onValueChange={(selectedID) => {
																		const selectedCourse =
																			filterCoursesData.find(
																				(course) => course.id === selectedID,
																			);

																		setFormData((prev) => ({
																			...prev,
																			[formData.us_courses ===
																			"Senior High School"
																				? "us_tracks"
																				: "us_institute"]:
																				selectedCourse?.cs_title || "",
																		}));

																		setSelectedCourseID(selectedID);
																	}}
																	required
																>
																	<SelectTrigger className="w-full h-9">
																		<SelectValue
																			placeholder={
																				formData.us_courses ===
																				"Senior High School"
																					? "Select Track"
																					: "Select Institute"
																			}
																		/>
																	</SelectTrigger>
																	<SelectContent>
																		{filterCoursesData.map((course) => (
																			<SelectItem
																				key={course.id}
																				value={course.id}
																			>
																				{course.cs_title}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</div>

															<div>
																<label className="block text-foreground font-medium mb-2 text-sm">
																	{formData.us_courses === "Senior High School"
																		? "Strand"
																		: "Program"}
																</label>
																<Select
																	value={
																		formData.us_courses === "Senior High School"
																			? formData?.us_strand
																			: formData?.us_program
																	}
																	onValueChange={(value) =>
																		setFormData((prev) => ({
																			...prev,
																			[formData.us_courses ===
																			"Senior High School"
																				? "us_strand"
																				: "us_program"]: value,
																		}))
																	}
																	required
																>
																	<SelectTrigger className="w-full h-9">
																		<SelectValue
																			placeholder={
																				formData.us_courses ===
																				"Senior High School"
																					? "Select Strand"
																					: "Select Program"
																			}
																		/>
																	</SelectTrigger>
																	<SelectContent>
																		{subCoursesData.map((subCourses, index) => (
																			<SelectItem
																				key={index}
																				value={subCourses}
																			>
																				{subCourses}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</div>
														</div>
													)}

													<div>
														<label className="block text-foreground font-medium mb-2 text-sm">
															Section
														</label>
														<Input
															name="us_section"
															value={formData?.us_section || ""}
															onChange={(e) => handleChange(e, setFormData)}
															placeholder="Enter section"
															className="bg-card border-border text-foreground h-9"
															required
														/>
													</div>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border transition-colors duration-300 h-fit">
								<CardHeader className="pb-4">
									<CardTitle className="text-foreground flex items-center gap-2 text-xl">
										Profile Picture
									</CardTitle>
									<p className="text-muted-foreground text-sm">
										Note: Format photos PNG, or JPG Max size 2mb
									</p>
								</CardHeader>

								<CardContent className="pt-0 space-y-6">
									<label
										htmlFor="cover-image-upload"
										className="w-[200px] h-[200px] mx-auto border-2 border-dashed border-border rounded-full text-center transition-colors cursor-pointer flex items-center justify-center overflow-hidden bg-muted/30"
									>
										<input
											type="file"
											accept=".jpg, .jpeg, .png"
											name="us_photoURL"
											className="hidden"
											onChange={(e) => handleChange(e, setFormData)}
											id="cover-image-upload"
										/>
										{formData?.us_photoURL ? (
											<img
												src={
													formData?.us_photoURL instanceof File
														? URL.createObjectURL(formData?.us_photoURL)
														: formData?.us_photoURL
												}
												alt="Profile preview"
												className="w-full h-full object-cover rounded-full"
											/>
										) : (
											<div className="space-y-1 text-center">
												<FiUpload className="w-5 h-5 mx-auto text-muted-foreground" />
												<p className="text-muted-foreground text-xs">
													Click to upload
												</p>
											</div>
										)}
									</label>

									<div className="mb-6">
										<h3 className="text-foreground font-semibold text-xl mb-1">
											Address
										</h3>
										<p className="text-muted-foreground text-sm mb-4">
											Provide province, municipality, and barangay for accurate
											location data.
										</p>

										<div className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-foreground font-medium mb-2 text-sm">
														Street
													</label>
													<Input
														name="us_street"
														value={formData?.us_street || ""}
														onChange={(e) => handleChange(e, setFormData)}
														placeholder="e.g., 123 Sampaguita St."
														className="bg-card border-border text-foreground h-9"
														required
													/>
												</div>

												<Select
													value={formData?.us_province}
													onValueChange={(value) =>
														setFormData((prev) => ({
															...prev,
															us_province: value,
														}))
													}
													required
												>
													<SelectTrigger className="w-full h-9 mt-6">
														<SelectValue placeholder="Select Province" />
													</SelectTrigger>
													<SelectContent>
														{provinces.map((p) => (
															<SelectItem
																key={p.code}
																value={`${p.code}|${p.name}`}
															>
																{p.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>

												<Select
													value={formData?.us_municipal}
													onValueChange={(value) =>
														setFormData((prev) => ({
															...prev,
															us_municipal: value,
														}))
													}
													required
												>
													<SelectTrigger className="w-full h-9">
														<SelectValue placeholder="Select Municipality" />
													</SelectTrigger>
													<SelectContent>
														{municipals.map((m) => (
															<SelectItem
																key={m.code}
																value={`${m.code}|${m.name}`}
															>
																{m.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<Select
													value={formData?.us_barangay}
													onValueChange={(value) =>
														setFormData((prev) => ({
															...prev,
															us_barangay: value,
														}))
													}
													required
												>
													<SelectTrigger className="w-full h-9">
														<SelectValue placeholder="Select Barangay" />
													</SelectTrigger>
													<SelectContent>
														{barangays.map((b) => (
															<SelectItem
																key={b.code}
																value={`${b.code}|${b.name}`}
															>
																{b.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>

									<div className="flex gap-3 justify-end">
										<Button
											type="submit"
											className="bg-primary-custom hover:bg-secondary-custom text-white h-10 w-fit text-sm"
										>
											<LoadingSpinner loading={btnLoading} />
											Register Account
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={handleCancel}
											className="bg-transparent hover:bg-accent text-foreground h-10 w-fit text-sm"
										>
											Cancel
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</form>
				</main>
			</div>
		</ProtectedRoute>
	);
}
