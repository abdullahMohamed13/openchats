<div align="center">

<img src="public/logo.webp" alt="OpenChats logo" width="120" />

# OpenChats

All-in-one team chatting platform. Your teams, your conversations, one place.

</div>

<!--## Demo-->

<!--![OpenChats Demo](./public/demo-placeholder.gif)-->

<!--*Demo coming soon.*-->

## Overview

OpenChats is a modern team chat application that brings workspaces, channels, and direct messages together in one place. Built for teams with flexible access control, invite flows, and support for both authenticated users and guests.

## Features

### Workspaces & Organization
- **Workspaces** — Create separate spaces for different teams/projects. Each workspace has its own members, channels, and settings.
- **Channels** — Public channels within a workspace. A `general` channel is created automatically when a workspace is set up.
- **Direct Messages** — Private 1:1 conversations between workspace members.
- **Workspace Settings** — Customize workspace name, avatar (up to 5 MB images), and manage members/invites (admin/owner only).

### Messaging
- **Real-time Chat** — Powered by [Stream Chat](https://getstream.io/chat/) for fast, reliable messaging.
- **Rich Interactions** — Reactions, replies/threads, file uploads, and emoji support.
- **Notifications** — Stay on top of mentions and unread messages.

### Authentication & Access
- **Multiple Auth Methods** — Sign in with email/password, GitHub, or Google via [Better Auth](https://better-auth.com).
- **Guest Mode** — Try the app without creating an account. Guests get access to a shared "Guest Lounge" and a private guest workspace, with certain features locked until upgrading to a full account.
- **Account Upgrades** — Link guest sessions to full accounts seamlessly.

### Invitations & Membership
- **Link Invites** — Generate reusable invite links (valid for 30 days) to invite people to a workspace.
- **Email Invites** — Send invites by email (valid for 7 days).
- **Username Invites** — Directly add existing OpenChats users by username.
- **Role Management** — Assign roles to members and control permissions.

### User Experience
- **Onboarding Flow** — Guided setup for new users.
- **Profile Management** — Customize your profile.
- **Responsive UI** — Built with Tailwind CSS v4 and modern React patterns.

## Roles & Permissions

Workspace members have three roles with different levels of access:

| Permission | Owner | Admin | Member |
|-------------|-------|-------|--------|
| View workspace & channels | ✓ | ✓ | ✓ |
| Send messages | ✓ | ✓ | ✓ |
| Manage workspace settings (name, avatar) | ✓ | ✓ | ✗ |
| Invite members (link/email/username) | ✓ | ✓ | ✗ |
| Revoke invites | ✓ | ✓ | ✗ |
| Manage members & roles | ✓ | ✓ | ✗ |
| Delete workspace | ✓ | ✗ | ✗ |

**Notes:**
- Each workspace must have an owner. Only owners can delete a workspace.
- Guests can read and chat in guest workspaces, but account-level actions (creating workspaces/channels, managing invites, certain profile changes) require a full account.

## Limits & Constraints

| Item | Limit |
|------|-------|
| Workspace image size | 5 MB (images only) |
| Link invite expiration | 30 days |
| Email invite expiration | 7 days |
| Workspace names | Must be unique per owner |
| Sign-in attempts | Rate-limited per username |

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router) + [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Backend:** [Convex](https://convex.dev) (database, functions, storage)
- **Authentication:** [Better Auth](https://better-auth.com)
- **Chat/Messaging:** [Stream Chat](https://getstream.io/chat/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/), [Base UI](https://base-ui.com/), custom components
- **Animations:** [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/)
- **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com) via [OpenNext](https://opennext.js.org)

## License

Copyright (c) 2026 Abdallah Mohamed. All rights reserved.

This project is proprietary and not licensed for public use, distribution, or modification. See [LICENSE](LICENSE) for details.
