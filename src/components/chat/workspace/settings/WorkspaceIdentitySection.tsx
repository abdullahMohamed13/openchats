"use client";

import { useEffect, useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { getErrorMessage } from "@/lib/error-message";
import { WorkspaceAvatar } from "../WorkspaceAvatar";

const MAX_WORKSPACE_IMAGE_BYTES = 5 * 1024 * 1024;

interface WorkspaceIdentitySectionProps {
	workspaceId: Id<"workspaces">;
	workspaceName: string;
	workspaceImageUrl: string | null;
	onBusyChange: (busy: boolean) => void;
}

export function WorkspaceIdentitySection({
	workspaceId,
	workspaceName,
	workspaceImageUrl,
	onBusyChange,
}: WorkspaceIdentitySectionProps) {
	const renameWorkspace = useAction(api.workspaces.renameWorkspace);
	const generateImageUploadUrl = useMutation(
		api.workspaces.generateWorkspaceImageUploadUrl,
	);
	const setWorkspaceImage = useMutation(api.workspaces.setWorkspaceImage);
	const removeWorkspaceImage = useMutation(api.workspaces.removeWorkspaceImage);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [name, setName] = useState(workspaceName);
	const [savingName, setSavingName] = useState(false);
	const [nameSaved, setNameSaved] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [removingImage, setRemovingImage] = useState(false);
	const [imageSaved, setImageSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const busy = savingName || uploadingImage || removingImage;

	useEffect(() => {
		if (!busy) return;
		onBusyChange(true);
		return () => onBusyChange(false);
	}, [busy, onBusyChange]);

	const trimmedName = name.trim();
	const canRename =
		trimmedName.length >= 2 &&
		trimmedName.length <= 50 &&
		trimmedName !== workspaceName &&
		!savingName;

	const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canRename) return;

		setSavingName(true);
		setNameSaved(false);
		setError(null);
		try {
			await renameWorkspace({ workspaceId, name: trimmedName });
			setNameSaved(true);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not rename workspace."));
		} finally {
			setSavingName(false);
		}
	};

	const handleImageSelected = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setError("Choose an image file.");
			return;
		}
		if (file.size > MAX_WORKSPACE_IMAGE_BYTES) {
			setError("Workspace images must be 5 MB or smaller.");
			return;
		}

		setUploadingImage(true);
		setImageSaved(false);
		setError(null);
		try {
			const uploadUrl = await generateImageUploadUrl({ workspaceId });
			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!response.ok) {
				throw new Error("Could not upload the image.");
			}
			const { storageId } = (await response.json()) as {
				storageId: Id<"_storage">;
			};
			await setWorkspaceImage({ workspaceId, storageId });
			setImageSaved(true);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not update workspace image."));
		} finally {
			setUploadingImage(false);
		}
	};

	const handleRemoveImage = async () => {
		setRemovingImage(true);
		setImageSaved(false);
		setError(null);
		try {
			await removeWorkspaceImage({ workspaceId });
			setImageSaved(true);
		} catch (cause) {
			setError(getErrorMessage(cause, "Could not remove workspace image."));
		} finally {
			setRemovingImage(false);
		}
	};

	return (
		<>
			<section>
				<div className="mt-2 flex flex-wrap items-center gap-4">
					<WorkspaceAvatar
						name={workspaceName}
						imageUrl={workspaceImageUrl}
						className="size-16 rounded-none border-2 border-foreground bg-muted shadow-[3px_3px_0px_var(--foreground)]"
						initialsClassName="text-sm"
					/>
					<div className="flex flex-wrap items-center gap-2">
						<input
							ref={fileInputRef}
							id="workspace-image"
							name="workspace-image"
							type="file"
							accept="image/*"
							aria-label="Workspace image"
							className="sr-only"
							disabled={busy}
							onChange={(event) => void handleImageSelected(event)}
						/>
						<Button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={busy}
							className="px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
						>
							{uploadingImage
								? "Uploading…"
								: workspaceImageUrl
									? "Change image"
									: "Upload image"}
						</Button>
						{workspaceImageUrl && (
							<Button
								type="button"
								variant="destructive"
								onClick={() => void handleRemoveImage()}
								disabled={busy}
								className="px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
							>
								{removingImage ? "Removing…" : "Remove"}
							</Button>
						)}
					</div>
				</div>
				<p className="mt-2 text-xs text-muted-foreground">
					PNG, JPG, GIF or WebP, up to 5 MB.
				</p>
				{imageSaved && (
					<p role="status" className="mt-2 text-xs text-success">
						Workspace image updated.
					</p>
				)}
			</section>

			<section className="mt-6">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Name
				</h3>
				<form
					onSubmit={handleRename}
					className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-center"
				>
					<Input
						value={name}
						onChange={(event) => {
							setName(event.target.value);
							setNameSaved(false);
						}}
						disabled={savingName}
						maxLength={50}
						aria-label="Workspace name"
						className="h-11 flex-1"
					/>
					<Button
						type="submit"
						disabled={!canRename}
						className="shrink-0 px-4 py-2 text-xs uppercase disabled:cursor-not-allowed disabled:opacity-50"
					>
						{savingName ? "Saving…" : "Save"}
					</Button>
				</form>
				{nameSaved && (
					<p role="status" className="mt-2 text-xs text-success">
						Workspace renamed.
					</p>
				)}
			</section>

			{error && (
				<p role="alert" className="mt-4 text-xs text-danger">
					{error}
				</p>
			)}
		</>
	);
}
