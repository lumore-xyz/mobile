import formatDate from "@/src/utils/helpers/formatDate";
import getDateFromAge from "@/src/utils/helpers/getDateFromAge";
import isDateWithinAgeRange from "@/src/utils/helpers/isDateWithinAgeRange";
import parseTypedDate from "@/src/utils/helpers/parseTypedDate";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, Text, TextInput as RNTextInput, View } from "react-native";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";

interface DateInputProps {
  date?: Date;
  onChange: (date: Date) => void;
  label: string;
  helperText?: string;
  errorText?: string;
  min?: number;
  max?: number;
}

const DATE_PLACEHOLDER = "DD/MM/YYYY";

const DateInput: React.FC<DateInputProps> = ({
  date = getDateFromAge(18),
  min = 18,
  max = 50,
  onChange,
  label,
  helperText,
  errorText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedDate, setTypedDate] = useState("");
  const [localErrorText, setLocalErrorText] = useState("");
  const formattedDate = useMemo(() => formatDate(date), [date]);

  useEffect(() => {
    setTypedDate(formattedDate);
    setLocalErrorText("");
  }, [formattedDate]);

  const commitTypedDate = () => {
    const normalizedTypedDate = typedDate.trim();

    if (!normalizedTypedDate) {
      setLocalErrorText(`Please enter date in ${DATE_PLACEHOLDER} format.`);
      return;
    }

    const parsedDate = parseTypedDate(normalizedTypedDate);
    if (!parsedDate) {
      setLocalErrorText(`Please use ${DATE_PLACEHOLDER} or DDMMYYYY format.`);
      return;
    }

    if (!isDateWithinAgeRange(parsedDate, min, max)) {
      setLocalErrorText(`Date should match age between ${min} and ${max}.`);
      return;
    }

    setLocalErrorText("");
    onChange(parsedDate);
    setTypedDate(formatDate(parsedDate));
  };

  return (
    <View>
      <Text className="mb-2 text-lg font-bold text-ui-ink">{label}</Text>
      <View className="w-full flex-row items-center justify-between gap-3 rounded-[22px] border border-ui-parchment bg-ui-surface-page p-3">
        <RNTextInput
          value={typedDate}
          onChangeText={(text) => {
            setTypedDate(text);
            if (localErrorText) setLocalErrorText("");
          }}
          onBlur={commitTypedDate}
          onSubmitEditing={commitTypedDate}
          placeholder={DATE_PLACEHOLDER}
          maxLength={10}
          keyboardType="number-pad"
          autoCorrect={false}
          autoCapitalize="none"
          className="min-h-11 flex-1 text-xl font-semibold text-ui-ink"
          accessibilityLabel={`${label} input`}
        />
        <Pressable
          onPress={() => setIsOpen(true)}
          className="min-h-11 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-4 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={`Open ${label} picker`}
        >
          <Icon name="CalendarDays" size={16} color={COLORS.paper} />
          <Text className="font-semibold text-ui-paper">Change</Text>
        </Pressable>
        {isOpen ? (
          <DateTimePicker
            value={new Date(date || null)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={getDateFromAge(min)} // youngest: 18 years old
            minimumDate={getDateFromAge(max)} // oldest: 50 years old
            onChange={(event, selectedDate) => {
              if (event.type === "dismissed") {
                setIsOpen(false);
                return;
              }

              setIsOpen(Platform.OS === "ios");

              if (selectedDate) {
                onChange(selectedDate);
                setTypedDate(formatDate(selectedDate));
                setLocalErrorText("");
              }
            }}
            onTouchCancel={() => setIsOpen(false)}
          />
        ) : null}
      </View>
      {helperText ? (
        <Text className="mt-2 text-sm leading-5 text-ui-slate">{helperText}</Text>
      ) : null}
      {localErrorText ? (
        <Text className="mt-2 text-sm font-medium text-ui-danger">
          {localErrorText}
        </Text>
      ) : null}
      {errorText ? (
        <Text className="mt-2 text-sm font-medium text-ui-danger">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
};

export default DateInput;
