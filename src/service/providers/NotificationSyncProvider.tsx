import React from "react";

import { useNotificationSocketSync } from "../../hooks/useNotifications";

const NotificationSyncProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useNotificationSocketSync();
  return <>{children}</>;
};

export default NotificationSyncProvider;
