import SurfacePanel from "@/src/components/ui/SurfacePanel";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import FieldEditorSheet from "../components/profile/FieldEditorSheet";
import EditPreferenceSkeleton from "../components/profile/EditPreferenceSkeleton";
import PrefrenceFieldsList from "../components/profile/PrefrenceFieldsList";
import type { UserPreferences } from "../domain/profile/types";
import getProfileCompletion from "../domain/profile/getProfileCompletion";
import { useUserPrefrence } from "../hooks/useUserPrefrence";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { updateUserPreferences } from "@/src/features/profile/api";
import { profileQueryKeys } from "@/src/features/profile/queryKeys";
import { queryClient } from "../service/query-client";
import { PREFERENCE_MATCH_COUNT_QUERY_KEY } from "../service/query-keys";
import { getUser } from "../service/storage";

const EditPreferenceScreen = () => {
  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [editFieldType, setEditFieldType] = useState<keyof UserPreferences>();
  const [preferences, setPreferences] = useState<UserPreferences>();
  const _user = getUser();
  const userId = _user?._id;
  const { userPrefrence, isLoading } = useUserPrefrence(userId);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (userPrefrence) {
      setPreferences(userPrefrence);
    }
  }, [userPrefrence]);

  const handleEditField = (field: keyof UserPreferences) => {
    setEditFieldType(field);
    setIsEditFieldOpen(true);
  };

  const handleFieldUpdate = async (field: string, value: unknown) => {
    try {
      setPreferences((prev) => {
        return prev ? ({ ...prev, [field]: value } as UserPreferences) : prev;
      });

      await updateUserPreferences({ [field]: value });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: profileQueryKeys.preferences(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: PREFERENCE_MATCH_COUNT_QUERY_KEY,
        }),
      ]);
      setIsEditFieldOpen(false);
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const {
    preferenceCompletion: completionPercent,
    preferenceMissingCount: missingCount,
  } = getProfileCompletion(null, preferences);

  if (isLoading && !preferences) {
    return (
      <View className="flex-1 bg-ui-surface-page">
        <SubPageBack title="Edit Preference" />
        <ScrollView className="px-4" contentContainerClassName="pb-8 pt-4">
          <EditPreferenceSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Edit Preference" />
      <FieldEditorSheet
        key={editFieldType}
        isOpen={isEditFieldOpen}
        setIsOpen={setIsEditFieldOpen}
        fieldType={editFieldType as string}
        onUpdate={handleFieldUpdate}
        currentValue={
          editFieldType && preferences ? preferences[editFieldType] : null
        }
        schemaType="preferences"
      />
      <ScrollView
        ref={scrollRef}
        className="px-4"
        contentContainerClassName="pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <SurfacePanel surface="midnight" className="mb-5 overflow-hidden">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-paper"
                accessibilityRole="header"
              >
                Tune the people you meet
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-paper/70">
                Your preferences help Lumore find matches that feel intentional,
                not random.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="SlidersHorizontal" size={20} color={COLORS.ink} />
            </View>
          </View>
        </SurfacePanel>

        <SurfacePanel surface="paper">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                Match preference strength
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Complete preferences make your pool more relevant.
              </Text>
            </View>
            <View className="min-h-11 min-w-14 items-center justify-center rounded-2xl bg-ui-forest px-3">
              <Text className="font-bold text-ui-paper">
                {completionPercent}%
              </Text>
            </View>
          </View>
          <View className="mt-4 h-2.5 w-full rounded-full bg-ui-forest/10">
            <View
              className="h-2.5 rounded-full bg-ui-forest"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
          <Text className="mt-3 text-sm leading-5 text-ui-slate">
            {missingCount > 0
              ? `${missingCount} preference${missingCount === 1 ? "" : "s"} left to complete.`
              : "You’re all set — your preferences are complete."}
          </Text>
        </SurfacePanel>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => handleEditField("interestedIn")}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-4 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Edit interested in preference"
          >
            <Icon name="Heart" size={17} color={COLORS.paper} />
            <Text className="font-semibold text-ui-paper">Interested in</Text>
          </Pressable>
          <Pressable
            onPress={() => handleEditField("goal")}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-ui-forest/25 bg-ui-paper px-4 active:bg-ui-forest/5"
            accessibilityRole="button"
            accessibilityLabel="Edit relationship goals"
          >
            <Icon name="Target" size={17} color={COLORS.forest} />
            <Text className="font-semibold text-ui-forest">Goals</Text>
          </Pressable>
        </View>

        <PrefrenceFieldsList
          preferences={preferences}
          onEdit={handleEditField}
        />
      </ScrollView>
    </View>
  );
};

export default EditPreferenceScreen;
