import type { Metadata } from "next";
import { InviteAccept } from "@/components/chat/invite-accept";

export const metadata: Metadata = {
	title: "Workspace invite",
	description: "Join a workspace on OpenChats.",
};

type InvitePageProps = {
	params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
	const { token } = await params;
	return <InviteAccept token={token} />;
}
