import NotificationsScreen from "@/src/screens/Notifications";
import { useNotificationSocketSync } from "@/src/hooks/useNotifications";
import React from "react";

const NotificationsRoute = () => {
  useNotificationSocketSync();
  return <NotificationsScreen />;
};

export default NotificationsRoute;
