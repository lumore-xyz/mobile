import SurfacePanel from "@/src/components/ui/SurfacePanel";
import type { ProfileTrait } from "@/src/domain/profile/buildProfileTraits";
import SectionHeading from "@/src/components/profile/SectionHeading";
import InfoItemVerticle from "@/src/components/profile/InfoItemVerticle";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

interface ProfileEssentialsSectionProps {
  horizontalTraits: ProfileTrait[];
  verticalTraits: ProfileTrait[];
  isOwner: boolean;
}

const ProfileEssentialsSection = ({
  horizontalTraits,
  verticalTraits,
  isOwner,
}: ProfileEssentialsSectionProps) => (
  <SurfacePanel surface="paper" className="mt-5 w-full">
    <SectionHeading
      title="The essentials"
      subtitle="A quick glimpse at personality and lifestyle"
    />
    <View className="flex-row flex-wrap">
      {horizontalTraits.map((trait) => (
        <View
          key={`${trait.icon}-${trait.value}`}
          className="mb-2 mr-2 flex-row items-center gap-2 rounded-full bg-ui-forest/5 px-3 py-2.5"
        >
          <Icon name={trait.icon} size={16} />
          <Text className="text-sm">{trait.value}</Text>
        </View>
      ))}
    </View>
    {horizontalTraits.length || verticalTraits.length ? (
      <>
        {verticalTraits.length ? (
          <View className="mt-3 h-px w-full bg-ui-parchment" />
        ) : null}
        <View>
          {verticalTraits.map((trait) => (
            <InfoItemVerticle
              key={`${trait.icon}-${trait.value}`}
              icon={trait.icon}
              type={trait.type || "lucide"}
              value={trait.value}
            />
          ))}
        </View>
      </>
    ) : (
      <View className="mt-3 rounded-2xl bg-ui-forest/5 p-4">
        <Text className="text-sm leading-5 text-ui-slate">
          {isOwner
            ? "Add profile details to build your snapshot."
            : "No public details yet."}
        </Text>
      </View>
    )}
  </SurfacePanel>
);

export default ProfileEssentialsSection;
