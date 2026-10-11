import SurfacePanel from "@/src/components/ui/SurfacePanel";
import Skeleton from "@/src/components/ui/Skeleton";
import { View } from "react-native";

const EditProfileSkeleton = () => (
  <View>
    <View className="items-center mt-2">
      <Skeleton width="100%" height={132} radius={32} />
      <Skeleton width={120} height={120} radius={30} style={{ marginTop: 16 }} />
      <Skeleton width={170} height={13} style={{ marginTop: 14 }} />
    </View>

    <SurfacePanel surface="paper" className="mt-6">
      <View className="flex-row items-center justify-between">
        <Skeleton width={140} height={14} />
        <Skeleton width={42} height={13} />
      </View>
      <Skeleton width="100%" height={8} radius={999} style={{ marginTop: 12 }} />
      <Skeleton width="48%" height={11} style={{ marginTop: 10 }} />
    </SurfacePanel>

    <View className="mt-5 gap-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <View
          key={`edit-profile-skeleton-${index}`}
          className="rounded-2xl border border-ui-ink/10 bg-ui-paper p-4"
        >
          <Skeleton width={index % 2 ? "38%" : "52%"} height={12} />
          <Skeleton width="86%" height={12} style={{ marginTop: 10 }} />
        </View>
      ))}
    </View>
  </View>
);

export default EditProfileSkeleton;
