# Rewarded Ads

## Purpose

Let users earn credits by watching rewarded ads.

## Current Behavior

The app provides an ad provider/hook for rewarded ad state. Earn Credits screen shows balance, rewarded ad claim flow, and posts backend claim payloads after ad completion.

## Key Files

- Route: `src/app/(subpage)/earn-credits.tsx`
- Screen: `src/screens/EarnCredits.tsx`
- Hook: `src/hooks/useAd.ts`
- Provider: `src/service/providers/AdProvider.tsx`
- API: `claimRewardedAdCredit`

## Data/API Dependencies

- `POST /credits/rewarded-ad-claim`
- `react-native-google-mobile-ads`

## UX Requirements

Make ad loading, unavailable, watched, failed, and claimed states explicit. Never imply credits are granted before backend confirmation.

## Open Questions

- What cooldown or daily cap applies to rewarded ads?

## Future Work

- Add ad failure recovery copy.
- Document ad unit configuration.
