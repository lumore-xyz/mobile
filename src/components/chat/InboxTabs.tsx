import Tabs, { type TabItem } from "@/src/components/ui/Tabs";
import type { InboxTab } from "@/src/domain/chat/inboxTypes";
import React, { useMemo } from "react";

const InboxTabs = React.memo(function InboxTabs({
  activeTab,
  onTabChange,
  activeCount,
  archiveCount,
}: {
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  activeCount?: number;
  archiveCount?: number;
}) {
  const tabs: TabItem[] = useMemo(
    () => [
      { key: "active", label: "Active", count: activeCount },
      { key: "archive", label: "Archived", count: archiveCount },
    ],
    [activeCount, archiveCount],
  );

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onSelect={(key) => onTabChange(key as InboxTab)}
      showBadges
      hapticFeedback={true}
    />
  );
});

export default InboxTabs;
