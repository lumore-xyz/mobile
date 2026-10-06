import MobileNav from '@/src/components/MobileNav';
import ExploreScreen from '@/src/screens/Explore';
import { View } from 'react-native';

export default function Explore() {
  return (
    <View className="flex-1 bg-ui-surface-page">
      <ExploreScreen />
      <MobileNav />
    </View>
  );
}
