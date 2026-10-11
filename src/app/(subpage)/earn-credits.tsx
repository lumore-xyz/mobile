import EarnCreditsScreen from "@/src/screens/EarnCredits";
import useCreditsRefresh from "@/src/features/credits/useCreditsRefresh";

const EarnCredits = () => {
  const { isRefreshing, refresh } = useCreditsRefresh();

  return (
    <EarnCreditsScreen isRefreshing={isRefreshing} onRefresh={refresh} />
  );
};

export default EarnCredits;
