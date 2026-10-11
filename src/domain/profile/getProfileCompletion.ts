import type { ProfileUser, UserPreferences } from "@/src/domain/profile/types";

const getProfileCompletion = (
  user?: ProfileUser | null,
  preferences?: UserPreferences | null,
) => {
  const profileFields = [
    user?.profilePicture,
    user?.bio,
    user?.gender,
    user?.dob,
    user?.interests?.length ? user.interests : null,
    user?.height,
    user?.diet,
    user?.zodiacSign,
    user?.lifestyle?.drinking,
    user?.lifestyle?.smoking,
    user?.lifestyle?.pets,
    user?.work,
    user?.institution,
    user?.languages?.length ? user.languages : null,
    user?.personalityType,
    user?.religion,
    user?.hometown,
  ];
  const preferenceFields = [
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
  const completionFor = (fields: unknown[]) => {
    const filledCount = fields.filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }).length;
    return {
      percent: fields.length
        ? Math.round((filledCount / fields.length) * 100)
        : 0,
      missingCount: fields.length - filledCount,
    };
  };
  const profileStats = completionFor(profileFields);
  const preferenceStats = completionFor(preferenceFields);

  return {
    profileCompletion: profileStats.percent,
    profileMissingCount: user ? profileStats.missingCount : 0,
    preferenceCompletion: preferenceStats.percent,
    preferenceMissingCount: preferences ? preferenceStats.missingCount : 0,
  };
};

export default getProfileCompletion;
