import { Input } from "@/components/ui/8bit/input";
import type { UsernameAvailability } from "@/lib/is-username-taken";
import { User } from "pixelarticons/react";

export type UsernameStatus = UsernameAvailability | "checking" | "idle";

interface UsernameStepProps {
	username: string;
	status: UsernameStatus;
	onChange: (value: string) => void;
}

export function UsernameStep({ username, status, onChange }: UsernameStepProps) {
	return (
		<div>
			<label htmlFor="username" className="mb-2 block text-sm ">
				Username
			</label>
			<div className="relative">
				<User
					width={16}
					height={16}
					className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					id="username"
					type="text"
					value={username}
					onChange={(event) => onChange(event.target.value)}
					placeholder="e.g. hysm_67"
					autoComplete="off"
					spellCheck={false}
					maxLength={20}
					className="h-12 pl-9 "
				/>
			</div>
			<p className="mt-2 text-xs text-muted-foreground">
				3-20 characters. Small letters only, numbers, dots and underscores.
			</p>
			{status === "taken" && (
				<p role="alert" className="mt-2 text-xs text-danger">
					This username is already taken.
				</p>
			)}
			{status === "unavailable" && (
				<p role="alert" className="mt-2 text-xs text-danger">
					Could not check this username. Try again.
				</p>
			)}
		</div>
	);
}
