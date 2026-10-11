import Tabs from "@/src/components/ui/Tabs";
import React from "react";

export type RoomSection = "pool" | "chats";

interface RoomSectionTabsProps {
  activeSection: RoomSection;
  poolCount: number;
  chatCount: number;
  onSelect: (section: RoomSection) => void;
}

const RoomSectionTabs = React.memo(function RoomSectionTabs({
  activeSection,
  poolCount,
  chatCount,
  onSelect,
}: RoomSectionTabsProps) {
  const tabs = [
    { key: "pool", label: "Matching pool", count: poolCount },
    { key: "chats", label: "Matched chats", count: chatCount },
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeSection}
      onSelect={(key) => onSelect(key as RoomSection)}
      showBadges
    />
  );
});

export default RoomSectionTabs;
