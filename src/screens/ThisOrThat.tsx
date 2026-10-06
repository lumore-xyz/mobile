import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import SubPageBack from '../components/headers/SubPageBack';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { fetchThisOrThatQuestions, submitThisOrThatAnswer } from '../libs/apis';
import { COLORS } from '../libs/constants/theme';
import Icon from '../libs/Icon';
import { triggerLightImpactHaptic, triggerSelectionHaptic } from '../utils/haptics';
import { ThisOrThatQuestion } from '../utils/types';

const ThisOrThatScreen = () => {
  const [index, setIndex] = useState(0);
  const [localTotal, setLocalTotal] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['this-or-that', 'questions'],
    queryFn: () => fetchThisOrThatQuestions(20),
  });

  const questions: ThisOrThatQuestion[] = data?.data || [];
  const current = questions[index];
  const total = questions.length;

  const { mutateAsync, isPending } = useMutation({
    mutationFn: submitThisOrThatAnswer,
  });

  useEffect(() => {
    if (!data?.data) return;
    setIndex(0);
    setLocalTotal(0);
  }, [data]);

  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.min(Math.round(((index + 1) / total) * 100), 100);
  }, [index, total]);

  const handleChoice = async (selection: 'left' | 'right') => {
    if (!current || isPending) return;
    try {
      triggerLightImpactHaptic();
      await mutateAsync({ questionId: current._id, selection });
      setLocalTotal((prev) => prev + 1);
      setIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to submit answer', error);
    }
  };

  const handleSkip = () => {
    if (!current) return;
    triggerSelectionHaptic();
    setIndex((prev) => prev + 1);
  };

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="This Or That" />
      <ScrollView className="px-4" contentContainerClassName="pb-10 pt-4">
        <View className="overflow-hidden rounded-[24px] bg-ui-midnight p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <View className="mb-3 self-start rounded-full bg-ui-champagne px-3 py-1">
                <Text className="text-xs font-bold text-ui-ink">
                  Profile game
                </Text>
              </View>
              <Text
                className="font-display text-[32px] leading-9 text-ui-paper"
                accessibilityRole="header"
              >
                Choose the option that feels most like you
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-paper/70">
                Every pick becomes a tiny personality signal that gives someone
                an easier way to start the conversation.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-aubergine">
              <Icon name="MousePointerClick" size={23} color={COLORS.paper} />
            </View>
          </View>

          <View className="mt-5 flex-row items-center justify-between rounded-[24px] bg-ui-paper/10 p-3">
            <View className="flex-row items-center gap-2">
              <Icon name="Sparkles" size={16} color={COLORS.champagne} />
              <Text className="text-sm font-semibold text-ui-paper">
                {localTotal} answered this round
              </Text>
            </View>
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                router.navigate('/(subpage)/games/this-or-that/submit');
              }}
              className="min-h-11 flex-row items-center justify-center gap-2 rounded-full bg-ui-champagne px-4 active:opacity-85"
              accessibilityRole="button"
              accessibilityLabel="Submit a This or That prompt"
            >
              <Text className="text-sm font-bold text-ui-ink">Create</Text>
              <Icon name="Plus" size={16} color={COLORS.ink} />
            </Pressable>
          </View>
        </View>

        <View className="mt-5 rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ui-slate">
                Question progress
              </Text>
              <Text className="mt-1 text-xl font-semibold text-ui-ink">
                {total
                  ? `${Math.min(index + 1, total)} of ${total}`
                  : 'Getting ready'}
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-forest/10">
              <Icon name="Gauge" size={20} color={COLORS.forest} />
            </View>
          </View>
          <View className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-ui-surface-page">
            <View
              className="h-2.5 rounded-full bg-ui-forest"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {isLoading ? <ThisOrThatLoadingSkeleton /> : null}

        {isError ? (
          <View className="mt-5 rounded-[24px] border border-ui-danger/20 bg-ui-paper p-5">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-danger/10">
              <Icon name="WifiOff" size={20} color={COLORS.danger} />
            </View>
            <Text className="mt-4 text-xl font-semibold text-ui-ink">
              Questions did not load
            </Text>
            <Text className="mt-2 text-sm leading-5 text-ui-slate">
              The game hit a quiet patch. Try again and we will pull fresh
              choices for you.
            </Text>
            <View className="mt-4">
              <Button text="Retry" onClick={() => refetch()} />
            </View>
          </View>
        ) : null}

        {!isLoading && !isError && !current ? (
          <View className="mt-5 items-center rounded-[24px] bg-ui-paper p-6">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="BadgeCheck" size={23} color={COLORS.ink} />
            </View>
            <Text className="mt-4 text-center text-2xl font-semibold text-ui-ink">
              You are all caught up
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
              You answered {localTotal} question{localTotal === 1 ? '' : 's'}.
              Come back for more prompts, or add one your kind of person would
              want to answer.
            </Text>
            <View className="mt-5 w-full gap-3">
              <Button text="Get more questions" onClick={() => refetch()} />
              <Button
                variant="outline"
                text="Submit a new one"
                onClick={() =>
                  router.navigate('/(subpage)/games/this-or-that/submit')
                }
              />
            </View>
          </View>
        ) : null}

        {current ? (
          <View className="mt-5 overflow-hidden rounded-[24px] bg-ui-paper">
            <View className="bg-ui-forest/10 p-5">
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-2 rounded-full bg-ui-paper px-3 py-1.5">
                  <Icon name="Tags" size={14} color={COLORS.forest} />
                  <Text className="text-xs font-bold text-ui-forest">
                    {current.category || 'general'}
                  </Text>
                </View>
                <Text className="text-xs font-semibold text-ui-slate">
                  Pick one
                </Text>
              </View>

              <Text className="mt-5 text-sm font-semibold text-ui-slate">
                Which one describes you better?
              </Text>
              <Text className="mt-1 text-2xl font-semibold leading-8 text-ui-ink">
                Your answer becomes part of your dating story.
              </Text>
            </View>

            <View className="gap-3 p-4">
              <ChoiceCard
                accent="highlight"
                disabled={isPending}
                imageUrl={current.leftImageUrl}
                label={current.leftOption}
                sideLabel="This"
                onPress={() => handleChoice('left')}
              />

              <ChoiceCard
                accent="accent"
                disabled={isPending}
                imageUrl={current.rightImageUrl}
                label={current.rightOption}
                sideLabel="That"
                onPress={() => handleChoice('right')}
              />
            </View>

            <View className="border-t border-ui-parchment/70 px-4 py-4">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ui-ink">
                    Not your question?
                  </Text>
                  <Text className="mt-0.5 text-xs leading-4 text-ui-slate">
                    Skip anything that does not feel like you.
                  </Text>
                </View>
                <Button
                  variant="outline"
                  text="Skip"
                  onClick={handleSkip}
                  disabled={isPending}
                  accessibilityLabel="Skip this question"
                />
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

type ChoiceCardProps = {
  accent: 'accent' | 'highlight';
  disabled: boolean;
  imageUrl?: string;
  label: string;
  sideLabel: string;
  onPress: () => void;
};

const ChoiceCard = ({
  accent,
  disabled,
  imageUrl,
  label,
  sideLabel,
  onPress,
}: ChoiceCardProps) => {
  const isRose = accent === 'accent';
  const iconColor = isRose ? COLORS.aubergine : COLORS.forest;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="min-h-[104px] overflow-hidden rounded-[26px] border border-ui-parchment bg-ui-surface-page active:opacity-85 disabled:opacity-60"
      accessibilityRole="button"
      accessibilityLabel={`Choose ${label}`}
      accessibilityState={{ disabled }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-44 w-full"
          resizeMode="cover"
        />
      ) : null}
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View
            className={`rounded-full px-3 py-1 ${
              isRose ? 'bg-ui-aubergine/10' : 'bg-ui-forest/10'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isRose ? 'text-ui-aubergine' : 'text-ui-forest'
              }`}
            >
              {sideLabel}
            </Text>
          </View>
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isRose ? 'bg-ui-aubergine/10' : 'bg-ui-forest/10'
            }`}
          >
            <Icon name="Heart" size={17} color={iconColor} />
          </View>
        </View>
        <Text className="mt-4 text-xl font-semibold leading-7 text-ui-ink">
          {label}
        </Text>
        <View className="mt-4 flex-row items-center gap-2">
          <Text
            className={`text-sm font-bold ${
              isRose ? 'text-ui-aubergine' : 'text-ui-forest'
            }`}
          >
            Choose this
          </Text>
          <Icon name="ArrowRight" size={16} color={iconColor} />
        </View>
      </View>
    </Pressable>
  );
};

const ThisOrThatLoadingSkeleton = () => (
  <View className="mt-5 overflow-hidden rounded-[24px] bg-ui-paper">
    <View className="bg-ui-forest/10 p-5">
      <View className="flex-row items-center justify-between">
        <Skeleton width={96} height={28} radius={999} />
        <Skeleton width={58} height={12} />
      </View>
      <Skeleton width="55%" height={12} style={{ marginTop: 22 }} />
      <Skeleton width="90%" height={24} style={{ marginTop: 8 }} />
    </View>

    <View className="gap-3 p-4">
      <View className="rounded-[26px] border border-ui-parchment bg-ui-surface-page p-4">
        <Skeleton width={74} height={24} radius={999} />
        <Skeleton width="78%" height={22} style={{ marginTop: 20 }} />
        <Skeleton width={96} height={16} style={{ marginTop: 18 }} />
      </View>
      <View className="rounded-[26px] border border-ui-parchment bg-ui-surface-page p-4">
        <Skeleton width={74} height={24} radius={999} />
        <Skeleton width="74%" height={22} style={{ marginTop: 20 }} />
        <Skeleton width={96} height={16} style={{ marginTop: 18 }} />
      </View>
    </View>

    <View className="border-t border-ui-parchment/70 px-4 py-4">
      <Skeleton width="100%" height={48} radius={999} />
    </View>
  </View>
);

export default ThisOrThatScreen;
