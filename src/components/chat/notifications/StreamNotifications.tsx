"use client";

import { useEffect, useRef } from "react";
import {
	hasSystemNotificationTag,
	useNotificationApi,
	useNotifications,
} from "stream-chat-react";
import { toast } from "@/components/ui/8bit/toast";

/**
 * Bridges Stream Chat's notification store to the app's 8bit toast.
 *
 * Stream Chat's default `NotificationList` is disabled in `StreamChatProvider`,
 * so every non-system notification is surfaced through `toast()` instead.
 */
export function StreamNotifications() {
	const notifications = useNotifications({
		filter: (notification) => !hasSystemNotificationTag(notification),
	});
	const { startNotificationTimeout } = useNotificationApi();
	const shownIdsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		const currentIds = new Set(notifications.map(({ id }) => id));

		shownIdsRef.current.forEach((id) => {
			if (!currentIds.has(id)) shownIdsRef.current.delete(id);
		});

		for (const notification of notifications) {
			if (shownIdsRef.current.has(notification.id)) continue;

			shownIdsRef.current.add(notification.id);
			toast(notification.message);
			startNotificationTimeout(notification.id);
		}
	}, [notifications, startNotificationTimeout]);

	return null;
}
