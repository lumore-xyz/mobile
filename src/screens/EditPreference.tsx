import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import FieldEditorSheet from "../components/profile/FieldEditorSheet";
import PrefrenceFieldsList from "../components/profile/PrefrenceFieldsList";
import { UserPreferences, useUserPrefrence } from "../hooks/useUserPrefrence";
import { updateUserPreferences } from "../libs/apis";
import { queryClient } from "../service/query-client";
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
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
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

  return (
    <View className="flex-1 bg-white">
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
        className="p-4"
        contentContainerClassName="pb-8"
      >
        {isLoading ? (
          <View className="py-6">
            <Text className="text-ui-shade">Loading preferences...</Text>
          </View>
        ) : null}

        <View className="p-4 rounded-2xl bg-ui-light border border-ui-shade/10">
          <Text className="text-base font-semibold">
            Match preferences
          </Text>
          <Text className="text-xs text-ui-shade mt-1">
            These help us tailor who you see.
          </Text>
          <View className="mt-3 h-2 w-full rounded-full bg-ui-shade/10">
            <View
              className="h-2 rounded-full bg-ui-highlight"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
          <Text className="text-xs text-ui-shade mt-2">
            {completionPercent}% complete
            {missingCount > 0 ? ` - ${missingCount} left` : ""}
          </Text>
        </View>

        <PrefrenceFieldsList
          preferences={preferences}
          onEdit={handleEditField as any}
        />
      </ScrollView>
    </View>
  );
};

export default EditPreferenceScreen;
