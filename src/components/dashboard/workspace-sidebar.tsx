"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Flag, Plus, Settings2, MoreVertical } from "pixelarticons/react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "./sign-out-button";
import type { MockWorkspace } from "@/data/dashboard/workspaces";
import type { MockUser } from "@/data/dashboard/users";

interface WorkspaceSidebarProps {
  workspaces: MockWorkspace[];
  activeWorkspaceId: string;
  currentUser: MockUser;
  onSelectWorkspace: (id: string) => void;
}

export function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  currentUser,
  onSelectWorkspace,
}: WorkspaceSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const needsOnboarding = !isPending && !!session && session.user.onboarded !== true;

  return (
    <aside className="hidden w-16 shrink-0 flex-col items-center gap-4 border-r border-border bg-muted py-4 lg:flex">
      <button
        type="button"
        aria-label="OpenChats home"
        title="OpenChats"
        className="flex size-10 items-center justify-center rounded-lg bg-primary font-press-start text-[10px] text-primary-foreground"
      >
        OC
      </button>

      <div className="flex flex-col items-center gap-2">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            type="button"
            onClick={() => onSelectWorkspace(workspace.id)}
            aria-label={workspace.name}
            title={workspace.name}
            className={cn(
              "relative flex size-10 items-center justify-center rounded-lg font-press-start text-[9px] transition-colors",
              workspace.id === activeWorkspaceId
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
            )}
          >
            {workspace.initials}
            {workspace.unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border border-muted bg-accent" aria-hidden />
            )}
          </button>
        ))}

        <button
          type="button"
          aria-label="Add or join a workspace"
          title="Add workspace"
          className="flex size-10 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <Plus width={18} height={18} />
        </button>
      </div>

      <div className="relative mt-auto flex flex-col items-center gap-3">
        {needsOnboarding && (
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            aria-label="Finish your setup"
            title="Finish your setup"
            className="relative flex size-9 items-center justify-center rounded-lg border border-dashed border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Flag width={18} height={18} />
            <span
              className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border border-muted bg-accent"
              aria-hidden
            />
          </button>
        )}

        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Settings2 width={18} height={18} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Your profile"
            title={currentUser.name}
            aria-expanded={menuOpen}
            className="relative block"
          >
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              width={36}
              height={36}
              className="size-9 rounded-full border-2 border-border object-cover"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border border-muted bg-success"
              aria-hidden
            />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute bottom-12 left-10 z-50 flex w-44 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-[4px_4px_0px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                  <Image
                    src={currentUser.avatar}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{currentUser.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{currentUser.title}</p>
                  </div>
                </div>
                <div className="flex flex-col p-1">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <MoreVertical width={16} height={16} aria-hidden />
                    Edit profile
                  </button>
                  <SignOutButton className="w-full justify-start gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}