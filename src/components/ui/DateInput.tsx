import { formatDate } from "@/src/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Text, View } from "react-native";
import Button from "./Button";

interface DateInputProps {
  date?: Date;
  onChange: (date: Date) => void;
  label: string;
  helperText?: string;
  errorText?: string;
  min?: number; // 👈 make it optional
  max?: number; // 👈 make it optional
}
const DateInput: React.FC<DateInputProps> = ({
  date = getDateFromAge(18),
  min = 18,
  max = 50,
  onChange,
  label,
  helperText,
  errorText,
}) => {
  const [isOpen, setisOpen] = useState(false);
  return (
    <View className="">
      <Text className="font-medium text-typography-900 text-xl mb-1">
        {label}
      </Text>
      <View className="w-full flex flex-row justify-between items-center border border-ui-shade/10 rounded-xl p-3">
        <Text className="text-ui-shade text-xl">{formatDate(date)}</Text>
        <Button
          size="md"
          variant="secondary"
          className="text-ui-light"
          onClick={() => setisOpen(true)}
          text="change"
        />
        {isOpen ? (
          <DateTimePicker
            value={new Date(date || null)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={getDateFromAge(min)} // youngest: 18 years old
            minimumDate={getDateFromAge(max)} // oldest: 45 years old
            onChange={(event, selectedDate) => {
              if (event.type === "dismissed") {
                setisOpen(false); // user cancelled
                return;
              }
              setisOpen(Platform.OS === "ios");
              if (selectedDate) {
                onChange(selectedDate || new Date());
              }
            }}
            onTouchCancel={() => setisOpen(false)}
          />
        ) : null}
      </View>
      {helperText ? (
        <Text className="text-xl text-typography-500 mt-2">{helperText}</Text>
      ) : null}
      {errorText ? (
        <Text className="text-red-500 mt-2">{errorText}</Text>
      ) : null}
    </View>
  );
};
export default DateInput;

/**
 * Returns a Date object representing the birthday of someone with the given age.
 * @param age - The age in years (e.g., 18)
 * @returns Date - The date that represents the birth date for that age
 */
export function getDateFromAge(age: number): Date {
  const today = new Date();
  // Subtract `age` years from today's date
  const birthDate = new Date(
    today.getFullYear() - age,
    today.getMonth(),
    today.getDate()
  );
  return birthDate;
}
