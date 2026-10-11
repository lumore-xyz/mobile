import CreditsScreen from "@/src/screens/Credits";
import useCreditsRefresh from "@/src/features/credits/useCreditsRefresh";

const Credits = () => {
  const { isRefreshing, refresh } = useCreditsRefresh();

  return (
    <CreditsScreen isRefreshing={isRefreshing} onRefresh={refresh} />
  );
};

export default Credits;
