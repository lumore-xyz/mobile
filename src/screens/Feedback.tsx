import SubPageBack from "../components/headers/SubPageBack";
import { fetchReceivedFeedbacks } from "../libs/apis";
import { FeedbackItem } from "../utils/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const FeedbackScreen = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["feedback", "received"],
    queryFn: fetchReceivedFeedbacks,
  });

  const items: FeedbackItem[] = data || [];

  return (
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="Feedback" />
      <ScrollView className="p-4" contentContainerClassName="pb-10">
        <View className="mb-4">
          <Text className="text-2xl font-bold">Received Feedback</Text>
          <Text className="text-sm text-ui-shade/70">
            Feedback shared by users after chat.
          </Text>
        </View>

        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <View
                key={index}
                className="h-24 rounded-xl border border-ui-shade/10 bg-ui-highlight/5"
              />
            ))}
          </View>
        ) : null}

        {isError ? (
          <Text className="text-sm text-red-500">
            Could not load feedback right now.
          </Text>
        ) : null}

        {!isLoading && !isError && (!items || items.length === 0) ? (
          <Text className="text-sm text-ui-shade/70">No feedback received yet.</Text>
        ) : null}

        {!isLoading && !isError && items?.length ? (
          <View className="gap-3">
            {items.map((item) => (
              <View
                key={item._id}
                className="rounded-xl border border-ui-shade/15 p-3 bg-white"
              >
                <View className="flex-row items-center justify-between gap-2 mb-2">
                  <Text className="text-sm font-medium">
                    {item.user?.nickname || item.user?.username || "Anonymous"}
                  </Text>
                  <Text className="text-xs text-ui-shade/70">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {typeof item.rating === "number" ? (
                  <Text className="text-xs text-ui-shade/80 mb-2">
                    Rating: {item.rating}/10
                  </Text>
                ) : null}

                <Text className="text-sm">
                  {item.feedback || "No feedback text provided."}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default FeedbackScreen;

