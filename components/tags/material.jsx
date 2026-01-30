import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "../../controller/custom/getStatusColor";

export const renderMaterials = (
	materialData,
	isBranch = false,
	isHorizontal = false,
	router,
) => {
	if (!materialData || materialData?.length === 0) return null;

	const Wrapper = ({ children }) =>
		isHorizontal ? (
			<div className="relative flex gap-6 overflow-x-auto pb-2">{children}</div>
		) : (
			<>{children}</>
		);

	return (
		<Wrapper>
			{materialData?.map((material, index) => (
				<Card
					key={index}
					className={`bg-card border-none shadow-sm transition-colors duration-300 hover:shadow-md rounded-lg flex-shrink-0 max-w-lg h-fit cursor-pointer`}
					onClick={() =>
						router.push(`/resources/material/details?id=${material.id}`)
					}
				>
					<CardContent className="flex gap-4 p-4">
						<img
							src={material.ma_coverURL || "/placeholder.svg"}
							alt={material.ma_title}
							className="h-28 w-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
						/>
						<div className="flex-1 min-w-0 space-y-2">
							<div>
								<h4 className="font-medium text-foreground text-base mb-1">
									{material.ma_title}
								</h4>

								<p className="text-primary-custom text-sm">
									{material.ma_copyright}
									<span className="text-muted-foreground">
										{" • "}
										{material.ma_libraryCall}
									</span>
								</p>
							</div>

							<div>
								<p className="text-sm">Author</p>
								<p className="text-muted-foreground text-sm">
									{material.ma_author}
								</p>
							</div>

							{isBranch && (
								<div>
									<p className="text-sm">Library Branch</p>
									<p className="text-muted-foreground text-sm">
										{material.ma_library}
									</p>
								</div>
							)}

							<div>
								<p className="text-sm">Description</p>
								<p className="text-muted-foreground text-sm line-clamp-3">
									{material.ma_description}
								</p>
							</div>

							<Button
								variant="link"
								size="sm"
								className="text-primary-custom hover:text-secondary-custom text-sm p-0"
								onClick={() =>
									router.push(`/resources/material/details?id=${material.id}`)
								}
							>
								View details
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</Wrapper>
	);
};

export const renderMaterialsTable = (
	materialData,
	isBranch = false,
	router,
) => {
	if (!materialData || materialData?.length === 0) return null;

	return (
		<div className="overflow-x-auto rounded-lg">
			<table className="w-full border border-border">
				<thead className="bg-muted">
					<tr className="border-b border-border">
						{[
							"Material Cover",
							"Call Number",
							"Title",
							"Copyright",
							"Status",
							"Format",
							"Material Type",
							"Category",
							"Shelf",
							...(isBranch ? ["Library Branch"] : []),
							"Description",
							"Copies",
							"Subject",
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
					{materialData?.map((material, index) => (
						<tr
							key={index}
							className={`cursor-pointer border-b border-border hover:bg-accent/30 transition-colors ${
								index % 2 === 0 ? "bg-background" : "bg-muted/10"
							}`}
							onClick={() =>
								router.push(`/resources/material/details?id=${material.id}`)
							}
						>
							<td className="py-4 px-6 text-center min-w-[150px] text-sm">
								<img
									src={material.ma_coverURL || "/placeholder.svg"}
									alt="material"
									className="h-28 w-20 object-cover rounded-lg bg-gray-100 flex-shrink-0"
								/>
							</td>
							<td className="py-4 px-6 text-center text-foreground min-w-[150px] text-sm">
								{material.ma_libraryCall}
							</td>
							<td className=" flex flex-col py-4 px-6 text-center min-w-[300px] text-sm">
								<span className="text-foreground font-medium text-sm">
									{material.ma_title}
								</span>
								<span className="text-muted-foreground text-sm">
									{material.ma_author}
								</span>
							</td>
							<td className="py-4 px-6 text-center text-foreground min-w-[150px] text-sm">
								{material.ma_copyright}
							</td>
							<td className="py-4 px-6 text-center min-w-[150px] text-sm">
								<Badge
									className={`${getStatusColor(material.ma_status)} text-sm`}
								>
									{material.ma_status}
								</Badge>
							</td>

							<td className="py-4 px-6 text-center text-foreground min-w-[150px] text-sm">
								{material.ma_format}
							</td>

							<td className="py-4 px-6 text-center text-foreground min-w-[150px] text-sm">
								{material.ma_type}
							</td>

							<td className="py-4 px-6 text-center text-foreground min-w-[150px] text-sm">
								{material.ma_category}
							</td>

							<td className="py-4 px-6 text-center text-foreground min-w-[150px] text-sm">
								{material.ma_shelf}
							</td>

							{isBranch && (
								<td className="py-4 px-6 text-center text-foreground min-w-[350px] text-sm ">
									{material.ma_library}
								</td>
							)}

							<td className="py-4 px-6 text-center text-foreground min-w-[350px] text-sm ">
								<div className="line-clamp-3">{material.ma_description}</div>
							</td>

							<td className="py-4 px-6 text-center text-foreground min-w-[150px] text-sm">
								{material.ma_copies}
							</td>

							<td className="py-4 px-6 text-center text-foreground min-w-[350px] text-sm">
								{material.ma_subjects}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
