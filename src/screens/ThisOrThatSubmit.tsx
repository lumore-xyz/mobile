import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import SubPageBack from '../components/headers/SubPageBack';
import Button from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { submitThisOrThatQuestion } from '../libs/apis';
import { COLORS } from '../libs/constants/theme';
import Icon from '../libs/Icon';
import {
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from '../utils/haptics';
import { toUserFacingError } from '../utils/userFacingError';

const ThisOrThatSubmitScreen = () => {
  const [leftOption, setLeftOption] = useState('');
  const [rightOption, setRightOption] = useState('');
  const [category, setCategory] = useState('');
  const [leftImageUri, setLeftImageUri] = useState<string | null>(null);
  const [rightImageUri, setRightImageUri] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuccess = statusMessage.startsWith('Submitted');
  const canSubmit = useMemo(
    () =>
      Boolean(
        leftOption.trim() &&
          rightOption.trim() &&
          leftImageUri &&
          rightImageUri &&
          !isSubmitting,
      ),
    [isSubmitting, leftImageUri, leftOption, rightImageUri, rightOption],
  );

  const pickImage = async (setter: (uri: string) => void) => {
    triggerSelectionHaptic();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
      setStatusMessage('Please enable photo permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
      setStatusMessage('');
    }
  };

  const handleSubmit = async () => {
    setStatusMessage('');
    if (!leftOption.trim() || !rightOption.trim()) {
      setStatusMessage('Please enter both options.');
      return;
    }
    if (!leftImageUri || !rightImageUri) {
      setStatusMessage('Please select both images.');
      return;
    }
    if (leftOption.trim().toLowerCase() === rightOption.trim().toLowerCase()) {
      setStatusMessage('Options must be different.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitThisOrThatQuestion({
        leftOption: leftOption.trim(),
        rightOption: rightOption.trim(),
        category: category.trim() || undefined,
        leftImageUri,
        rightImageUri,
      });
      setLeftOption('');
      setRightOption('');
      setCategory('');
      setLeftImageUri(null);
      setRightImageUri(null);
      triggerSuccessHaptic();
      setStatusMessage('Submitted! Your question is pending review.');
    } catch (err: any) {
      setStatusMessage(
        toUserFacingError(
          err,
          "We couldn't submit your question right now. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Submit Question" />
      <ScrollView className="px-4" contentContainerClassName="pb-10 pt-4">
        <View className="overflow-hidden rounded-[32px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <View className="mb-3 self-start rounded-full bg-ui-primary px-3 py-1">
                <Text className="text-xs font-bold text-ui-shade">
                  Create a prompt
                </Text>
              </View>
              <Text
                className="text-[32px] font-black leading-9 text-ui-light"
                accessibilityRole="header"
              >
                Make a choice people want to explain
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                The best This-or-That prompts are simple, visual, and a little
                revealing. Give both sides a clear vibe.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-accent">
              <Icon name="GitCompareArrows" size={23} color={COLORS.light} />
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-4">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-highlight/10">
              <Icon name="Lightbulb" size={18} color={COLORS.highlight} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-ui-shade">
                Prompt recipe
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                Use two distinct options, add images that make the choice
                instantly understandable, and keep the category short.
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 overflow-hidden rounded-[32px] bg-ui-light">
          <View className="bg-ui-highlight/10 p-5">
            <Text className="text-sm font-semibold text-ui-muted">
              Step 1
            </Text>
            <Text className="mt-1 text-2xl font-black text-ui-shade">
              Write the two sides
            </Text>
            <Text className="mt-1 text-sm leading-5 text-ui-muted">
              Make them specific enough to feel personal, but short enough to
              scan quickly.
            </Text>
          </View>

          <View className="gap-4 p-4">
            <TextInput
              label="This option"
              value={leftOption}
              action={setLeftOption}
              placeholder="Slow Sunday coffee"
              helperText="The first choice people can pick."
            />
            <TextInput
              label="That option"
              value={rightOption}
              action={setRightOption}
              placeholder="Midnight street food"
              helperText="Make this feel meaningfully different."
            />
            <TextInput
              label="Category"
              value={category}
              action={setCategory}
              placeholder="Lifestyle, Food, Travel..."
              helperText="Optional, but helpful for discovery and moderation."
            />
          </View>
        </View>

        <View className="mt-5 overflow-hidden rounded-[32px] bg-ui-light">
          <View className="bg-ui-accent/10 p-5">
            <Text className="text-sm font-semibold text-ui-muted">
              Step 2
            </Text>
            <Text className="mt-1 text-2xl font-black text-ui-shade">
              Add both images
            </Text>
            <Text className="mt-1 text-sm leading-5 text-ui-muted">
              Images make the choice feel instant. Use clear, tasteful visuals
              that match each option.
            </Text>
          </View>

          <View className="gap-4 p-4">
            <ImagePickerCard
              imageUri={leftImageUri}
              label="This image"
              tone="highlight"
              onPick={() => pickImage((uri) => setLeftImageUri(uri))}
            />
            <ImagePickerCard
              imageUri={rightImageUri}
              label="That image"
              tone="accent"
              onPick={() => pickImage((uri) => setRightImageUri(uri))}
            />
          </View>
        </View>

        {statusMessage ? (
          <View
            className={`mt-5 flex-row items-start gap-3 rounded-[24px] border p-4 ${
              isSuccess
                ? 'border-ui-highlight/20 bg-ui-highlight/10'
                : 'border-ui-danger/20 bg-ui-light'
            }`}
          >
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                isSuccess ? 'bg-ui-highlight/10' : 'bg-ui-danger/10'
              }`}
            >
              <Icon
                name={isSuccess ? 'BadgeCheck' : 'CircleAlert'}
                size={18}
                color={isSuccess ? COLORS.highlight : COLORS.danger}
              />
            </View>
            <Text
              className={`flex-1 text-sm font-semibold leading-5 ${
                isSuccess ? 'text-ui-highlight' : 'text-ui-danger'
              }`}
            >
              {statusMessage}
            </Text>
          </View>
        ) : null}

        <View className="mt-6">
          <Button
            text={isSubmitting ? 'Submitting...' : 'Submit for review'}
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            accessibilityLabel="Submit This or That question for review"
          />
          {!canSubmit && !isSubmitting ? (
            <Text className="mt-2 text-center text-xs leading-4 text-ui-muted">
              Add both options and both images to submit.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

type ImagePickerCardProps = {
  imageUri: string | null;
  label: string;
  tone: 'accent' | 'highlight';
  onPick: () => void;
};

const ImagePickerCard = ({
  imageUri,
  label,
  tone,
  onPick,
}: ImagePickerCardProps) => {
  const isRose = tone === 'accent';
  const toneColor = isRose ? COLORS.accent : COLORS.highlight;

  return (
    <View className="overflow-hidden rounded-[26px] border border-ui-border bg-ui-surface-page">
      <View className="flex-row items-center justify-between gap-3 p-4">
        <View className="flex-row items-center gap-3">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isRose ? 'bg-ui-accent/10' : 'bg-ui-highlight/10'
            }`}
          >
            <Icon name="ImagePlus" size={17} color={toneColor} />
          </View>
          <View>
            <Text className="text-base font-black text-ui-shade">{label}</Text>
            <Text className="mt-0.5 text-xs text-ui-muted">
              {imageUri ? 'Tap to replace image' : 'Required image'}
            </Text>
          </View>
        </View>
        {imageUri ? (
          <View className="rounded-full bg-ui-primary px-3 py-1">
            <Text className="text-xs font-bold text-ui-shade">Added</Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={onPick}
        className="mx-4 mb-4 overflow-hidden rounded-[22px] active:opacity-85"
        accessibilityRole="button"
        accessibilityLabel={`Select ${label.toLowerCase()}`}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="h-48 w-full"
            style={{ resizeMode: 'cover' }}
          />
        ) : (
          <View className="h-44 items-center justify-center rounded-[22px] border border-dashed border-ui-muted/40 bg-ui-light">
            <View
              className={`h-12 w-12 items-center justify-center rounded-full ${
                isRose ? 'bg-ui-accent/10' : 'bg-ui-highlight/10'
              }`}
            >
              <Icon name="Upload" size={20} color={toneColor} />
            </View>
            <Text className="mt-3 text-sm font-bold text-ui-shade">
              Tap to choose image
            </Text>
            <Text className="mt-1 text-center text-xs leading-4 text-ui-muted">
              Square or portrait photos work best.
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default ThisOrThatSubmitScreen;
