"use client";

import { FiInfo } from "react-icons/fi";
import { Modal } from "@/components/modal";

export function ViewReasonModal({ isOpen, onClose, transaction }) {
	if (!isOpen) return null;

	const remarks = transaction?.tr_remarks || [];
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Cancellation Reason"
			size="md"
		>
			<div className="p-6 space-y-6">
				<div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
					<FiInfo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
					<div>
						<p className="text-blue-800 dark:text-blue-300 text-sm">
							Below are the reason(s) provided for this transaction
							cancellation.
						</p>
					</div>
				</div>

				{isOpen && (
					<div className="space-y-3">
						<h3 className="font-normal text-foreground text-sm">
							Cancellation Details:
						</h3>
						<div className="bg-muted/30 p-4 rounded-lg border border-border">
							{remarks.length === 0 ? (
								<p className="text-muted-foreground italic text-sm">
									No remarks have been added for this transaction.
								</p>
							) : remarks.length === 1 ? (
								<p className="text-foreground leading-relaxed text-sm">
									{remarks[0]}
								</p>
							) : (
								<ul className="list-disc space-y-2 pl-5">
									{remarks.map((reason, index) => (
										<li
											key={index}
											className="text-foreground leading-relaxed text-sm"
										>
											{reason}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
}
