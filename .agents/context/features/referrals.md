# Referrals

## Purpose

Encourage growth and reward users for inviting others.

## Current Behavior

Users can view referral summary, apply a referral code, generate/share referral links, and the app captures pending referral codes from install referrer or URLs.

## Key Files

- Route: `src/app/(subpage)/referral.tsx`
- Screen: `src/screens/Referral.tsx`
- Service: `src/service/referralAttribution.ts`
- Provider: `src/service/providers/ReferralAttributionProvider.tsx`
- Storage: pending referral helpers in `src/service/storage.ts`

## Data/API Dependencies

- `GET /referral/summary`
- `POST /referral/apply`
- Install referrer / deep link data.

## UX Requirements

Referral rewards should be simple, celebratory, and transparent. Show applied/pending/error states clearly.

## Open Questions

- What exact reward is granted and when?
- Can a referral code be changed after signup?

## Future Work

- Document referral attribution lifecycle.
- Add share-channel analytics.
