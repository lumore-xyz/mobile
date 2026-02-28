export type CreditsBalance = {
  credits: number;
  rewardGrantedToday?: boolean;
  dailyRewardAmount?: number;
};

export type CreditHistoryItem = {
  _id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
};

export type CreditHistoryResponse = {
  items: CreditHistoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type ReferralSummary = {
  canAccess: boolean;
  referralCode: string;
  referralLink: string;
  referralRewardCredits: number;
  referredBy: string | null;
  stats: {
    referredTotal: number;
    referredVerified: number;
    rewardsEarned: number;
  };
};

export type ThisOrThatQuestion = {
  _id: string;
  leftOption: string;
  leftImageUrl?: string;
  rightOption: string;
  rightImageUrl?: string;
  category?: string;
  plays?: number;
  leftVotes?: number;
  rightVotes?: number;
};

export type ThisOrThatAnswer = {
  _id: string;
  questionId: string;
  selection: "left" | "right";
  selectedText: string;
  selectedImageUrl?: string;
  answeredAt: string;
  question?: {
    leftOption: string;
    leftImageUrl?: string;
    rightOption: string;
    rightImageUrl?: string;
    category?: string;
  };
};

export type FeedbackItem = {
  _id: string;
  user?: {
    _id: string;
    username?: string;
    nickname?: string;
    profilePicture?: string;
  };
  roomId?: {
    _id: string;
    createdAt?: string;
  };
  feedback?: string;
  reason?: string;
  rating?: number;
  createdAt: string;
};
