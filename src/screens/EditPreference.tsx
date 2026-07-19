import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import FieldEditorSheet from "../components/profile/FieldEditorSheet";
import PrefrenceFieldsList from "../components/profile/PrefrenceFieldsList";
import Skeleton from "../components/ui/Skeleton";
import { UserPreferences, useUserPrefrence } from "../hooks/useUserPrefrence";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { updateUserPreferences } from "../libs/apis";
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

  const handleFieldUpdate = async (field: keyof UserPreferences, value: any) => {
    try {
      setPreferences((prev) => {
        const newPrefs = { ...prev } as UserPreferences;
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          const parentKey = parent as keyof UserPreferences;
          const parentValue = newPrefs[parentKey] as Record<string, any>;
          // @ts-ignore
          newPrefs[parentKey] = {
            ...parentValue,
            [child]: value,
          } as typeof parentValue;
        } else {
          // @ts-ignore
          newPrefs[field] = value as (typeof newPrefs)[typeof field];
        }
        return newPrefs;
      });

      const updateData = field.includes(".")
        ? { [field.split(".")[0]]: { [field.split(".")[1]]: value } }
        : { [field]: value };

      await updateUserPreferences(updateData);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["user-profile", userId],
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

  const { completionPercent, missingCount } = useMemo(() => {
    if (!preferences) return { completionPercent: 0, missingCount: 0 };
    const fields = [
      preferences?.interestedIn,
      preferences?.ageRange?.length ? preferences.ageRange : null,
      preferences?.distance,
      preferences?.heightRange?.length ? preferences.heightRange : null,
      preferences?.goal,
      preferences?.relationshipType,
      preferences?.interests?.length ? preferences.interests : null,
      preferences?.languages?.length ? preferences.languages : null,
      preferences?.zodiacPreference?.length ? preferences.zodiacPreference : null,
      preferences?.personalityTypePreference?.length
        ? preferences.personalityTypePreference
        : null,
      preferences?.dietPreference?.length ? preferences.dietPreference : null,
      preferences?.religionPreference?.length
        ? preferences.religionPreference
        : null,
      preferences?.drinkingPreference?.length
        ? preferences.drinkingPreference
        : null,
      preferences?.smokingPreference?.length
        ? preferences.smokingPreference
        : null,
      preferences?.petPreference?.length ? preferences.petPreference : null,
    ];
    const filledCount = fields.filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }).length;
    const total = fields.length;
    const percent = total ? Math.round((filledCount / total) * 100) : 0;
    return { completionPercent: percent, missingCount: total - filledCount };
  }, [preferences]);

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
        onUpdate={handleFieldUpdate as any}
        currentValue={
          editFieldType && preferences ? preferences[editFieldType] : null
        }
        isLoading={isLoading}
        form={preferences as UserPreferences}
        schemaType="preferences"
      />
      <ScrollView
        ref={scrollRef}
        className="px-4"
        contentContainerClassName="pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="mb-5 overflow-hidden rounded-[32px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-light"
                accessibilityRole="header"
              >
                Tune the people you meet
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Your preferences help Lumore find matches that feel intentional,
                not random.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="SlidersHorizontal" size={20} color={COLORS.shade} />
            </View>
          </View>
        </View>

        <View className="rounded-[28px] border border-ui-border bg-ui-light p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-shade">
                Match preference strength
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                Complete preferences make your pool more relevant.
              </Text>
            </View>
            <View className="min-h-11 min-w-14 items-center justify-center rounded-full bg-ui-highlight px-3">
              <Text className="font-bold text-ui-light">
                {completionPercent}%
              </Text>
            </View>
          </View>
          <View className="mt-4 h-2.5 w-full rounded-full bg-ui-highlight/10">
            <View
              className="h-2.5 rounded-full bg-ui-highlight"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
          <Text className="mt-3 text-sm leading-5 text-ui-muted">
            {missingCount > 0
              ? `${missingCount} preference${missingCount === 1 ? "" : "s"} left to complete.`
              : "You’re all set — your preferences are complete."}
          </Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => handleEditField("interestedIn")}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-ui-highlight px-4 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Edit interested in preference"
          >
            <Icon name="Heart" size={17} color={COLORS.light} />
            <Text className="font-semibold text-ui-light">Interested in</Text>
          </Pressable>
          <Pressable
            onPress={() => handleEditField("goal")}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-ui-highlight/25 bg-ui-light px-4 active:bg-ui-highlight/5"
            accessibilityRole="button"
            accessibilityLabel="Edit relationship goals"
          >
            <Icon name="Target" size={17} color={COLORS.highlight} />
            <Text className="font-semibold text-ui-highlight">Goals</Text>
          </Pressable>
        </View>

        <PrefrenceFieldsList
          preferences={preferences}
          onEdit={handleEditField as any}
        />
      </ScrollView>
    </View>
  );
};

const EditPreferenceSkeleton = () => (
  <View>
    <Skeleton width="100%" height={132} radius={32} />

    <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
      <Skeleton width={150} height={14} />
      <Skeleton width={210} height={11} style={{ marginTop: 10 }} />
      <Skeleton width="100%" height={8} radius={999} style={{ marginTop: 12 }} />
      <Skeleton width={120} height={11} style={{ marginTop: 10 }} />
    </View>

    <View className="mt-5 gap-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <View
          key={`edit-preference-skeleton-${index}`}
          className="rounded-[22px] bg-ui-light p-4"
        >
          <Skeleton width={index % 2 ? "42%" : "56%"} height={12} />
          <Skeleton width="82%" height={12} style={{ marginTop: 10 }} />
        </View>
      ))}
    </View>
  </View>
);

export default EditPreferenceScreen;
