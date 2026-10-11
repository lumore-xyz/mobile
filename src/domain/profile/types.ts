export interface UserPreferences {
  interestedIn: string;
  ageRange: number[];
  distance: number;
  goal: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  interests: string[];
  relationshipType: string;
  languages: string[];
  zodiacPreference: string[];
  institutions: string[];
  personalityTypePreference: string[];
  dietPreference: string[];
  heightRange: number[];
  religionPreference: string[];
  drinkingPreference: string[];
  smokingPreference: string[];
  petPreference: string[];
}

export interface ProfileUser {
  _id: string;
  username?: string;
  email?: string;
  nickname?: string;
  realName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  bio?: string;
  dob?: string;
  gender?: string;
  orientation?: string;
  height?: number;
  distance?: number;
  diet?: string;
  zodiacSign?: string;
  bloodGroup?: string;
  work?: string;
  institution?: string;
  religion?: string;
  maritalStatus?: string;
  homeTown?: string;
  hometown?: string;
  interests?: string[];
  languages?: string[];
  personalityType?: string;
  location?: { formattedAddress?: string };
  web3Wallet?: { addresses?: string[] };
  fieldVisibility?: Record<string, string | undefined>;
  lifestyle?: { drinking?: string; smoking?: string; pets?: string };
  isViewerUnlockedByUser?: boolean;
  isViewerUnlockedUser?: boolean;
  isVerified?: boolean;
  verificationStatus?: string;
}

export interface ProfilePostContent {
  promptId?: string | { _id?: string; text?: string };
  promptAnswer?: string;
  imageUrls?: string[];
  imageUrl?: string;
  caption?: string;
  text?: string;
}

export interface ProfilePost {
  _id: string;
  type: "PROMPT" | "IMAGE" | "TEXT";
  content: ProfilePostContent;
  visibility?: string;
}
