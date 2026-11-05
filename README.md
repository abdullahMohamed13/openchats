<div align="center">

<img src="public/logo.webp" alt="OpenChats logo" width="120" />

# OpenChats

All-in-one team chatting platform. Your teams, your conversations, one place.

</div>

<!--## Demo-->

<!--![OpenChats Demo](./public/demo-placeholder.gif)-->

<!--*Demo coming soon.*-->

## Overview

OpenChats is a real-time team communication platform that brings
workspaces, channels, and direct messages together in one place. It is
designed for teams, organizations, clubs, communities, and project groups
that need organized conversations with flexible membership controls.

## Project Status

The core chat experience is implemented and usable, including real-time
messaging, workspace management, invitations, join requests, member roles,
guest access, profiles, notifications, and responsive chat navigation.

The project is currently focused on completing the foundation of the product;
advanced collaboration features such as threads, reactions, file sharing,
and voice/video communication are not yet implemented.

## Features

### Workspaces & Organization
- **Workspaces** — Create separate spaces for different teams/projects.
  Each workspace has its own members, channels, and settings.
- **Channels** — Public channels within a workspace. A `general` channel
  is created automatically when a workspace is set up and cannot be renamed
  or deleted.
- **Direct Messages** — Private 1:1 conversations between workspace
  members.
- **Workspace Settings** — Customize workspace name, avatar (up to 5 MB
  images), and manage members, invites, and join requests (admin/owner only).
- **Member Profiles** — View member names, usernames, avatars, email
  addresses, and workspace roles.

### Messaging
- **Real-time Chat** — Powered by [Stream Chat](https://getstream.io/chat/)
  for fast, reliable messaging.
- **Message Search** — Search across messages in any channel or DM.
- **Notifications** — Stay on top of unread messages with a unified
  notifications dialog and mark-all-read.
- **In-app Toasts** — Stream notifications are surfaced as toasts.

### Authentication & Access
- **Multiple Auth Methods** — Sign in with email/password, GitHub, or
  Google via [Better Auth](https://better-auth.com).
- **Username Sign-In** — Sign in with your username instead of email.
- **Guest Mode** — Try the app without creating an account. Guests get
  access to a shared "Guest Lounge" and a private "My Guest Space", with
  account-level features locked until upgrading to a full account.
- **Account Upgrades** — Link guest sessions to full accounts
  seamlessly, keeping your private guest messages.

### Invitations & Membership
- **Link Invites** — Generate reusable invite links (valid for 30 days)
  to invite people to a workspace.
- **Email Invites** — Send invites by email (valid for 7 days).
- **Username Invites** — Directly add existing OpenChats users by
  username.
- **Role Management** — Owners assign admin/member roles and control
  workspace permissions.
- **Join Requests** — Request to join a workspace by ID; admins can
  approve or decline.
- **Ownership Transfer** — Owners can transfer ownership to another member
  and continue as an admin.

### User Experience
- **Onboarding Flow** — Guided setup for new users (username, role,
  avatar, badge).
- **Profile Management** — Customize your profile, including username
  changes.
- **Responsive UI** — Built with Tailwind CSS v4 and modern React
  patterns.
- **Public Product Pages** — Landing page, Terms of Service, Privacy Policy,
  and branded 404 experience.

## Roles & Permissions

Workspace members have three roles with different levels of access:

| Permission | Owner | Admin | Member |
|-------------|-------|-------|--------|
| View workspace & channels | ✓ | ✓ | ✓ |
| Send messages | ✓ | ✓ | ✓ |
| Manage workspace settings (name, avatar) | ✓ | ✓ | ✗ |
| Invite members (link/email/username) | ✓ | ✓ | ✗ |
| Revoke invites | ✓ | ✓ | ✗ |
| Manage members | ✓ | ✓ | ✗ |
| Change member roles | ✓ | ✗ | ✗ |
| Transfer ownership | ✓ | ✗ | ✗ |
| Delete workspace | ✓ | ✗ | ✗ |

**Notes:**
- Each workspace must have an owner. Only owners can delete a workspace
  or transfer ownership.
- Only owners can change member roles (promote/demote between admin and
  member).
- Admins can manage members, but cannot remove other admins.
- Owners must delete the workspace or transfer ownership before leaving it.
- Guests can read and chat in guest workspaces, but account-level actions
  (creating workspaces/channels, managing invites, certain profile
  changes) require a full account.

## Limits & Constraints

| Item | Limit |
|------|-------|
| Workspace image size | 5 MB (images only) |
| Link invite expiration | 30 days |
| Email invite expiration | 7 days |
| Workspace names | Must be unique per owner |
| Sign-in attempts | Rate-limited per username |
| Channel name length | 1-40 characters |
| Guest workspace joining | Guest workspaces cannot be joined by workspace ID |

## Roadmap

The following capabilities are intentionally outside the current release:

- File and image attachments
- Message reactions and threaded replies
- Message editing and deletion
- Rich text, mentions, and code blocks
- Voice and video communication
- Push or email notifications outside the app
- Webhooks, bots, slash commands, and other external integrations
- Message pinning, bookmarks, and channel categories
- Detailed presence, analytics, keyboard shortcuts, and internationalization

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router) +
  [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Backend:** [Convex](https://convex.dev) (database, functions,
  storage)
- **Authentication:** [Better Auth](https://better-auth.com)
- **Chat/Messaging:** [Stream Chat](https://getstream.io/chat/)
- **UI Components:** [Radix UI](https://www.radix-ui.com),
  [Base UI](https://base-ui.com), custom components
- **Animations:** [Framer Motion](https://www.framer.com/motion),
  [GSAP](https://gsap.com/), [Lenis](https://lenis.dev/) (smooth scroll)
- **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com)
  via [OpenNext](https://opennext.js.org)

## License

Copyright (c) 2026 Abdallah Mohamed. All rights reserved.

This project is proprietary and not licensed for public use, distribution,
or modification. See [LICENSE](LICENSE) for details.
