import SurfacePanel from "@/src/components/ui/SurfacePanel";
import Skeleton from "@/src/components/ui/Skeleton";
import { View } from "react-native";

const EditPreferenceSkeleton = () => (
  <View>
    <Skeleton width="100%" height={132} radius={32} />

    <SurfacePanel surface="paper" className="mt-5">
      <Skeleton width={150} height={14} />
      <Skeleton width={210} height={11} style={{ marginTop: 10 }} />
      <Skeleton width="100%" height={8} radius={999} style={{ marginTop: 12 }} />
      <Skeleton width={120} height={11} style={{ marginTop: 10 }} />
    </SurfacePanel>

    <View className="mt-5 gap-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <View
          key={`edit-preference-skeleton-${index}`}
          className="rounded-[22px] bg-ui-paper p-4"
        >
          <Skeleton width={index % 2 ? "42%" : "56%"} height={12} />
          <Skeleton width="82%" height={12} style={{ marginTop: 10 }} />
        </View>
      ))}
    </View>
  </View>
);

export default EditPreferenceSkeleton;
