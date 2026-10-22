import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native'
import { DriverAppNavigationProp } from '../../../Navigation/RootNavigation';
import { useDriverStore } from '../../store/DriverStore';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStore } from '../../../Providers/Network/NetworkStore';


export default function Home() {
     const isOnline = useNetworkStore((store) => store.isOnline);
        const isConnected = useNetworkStore((store) => store.isConnected);
         const isInternetReachable = useNetworkStore((store) => store.isInternetReachable);
  const replaceNavigation = useNavigation<DriverAppNavigationProp>();


  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Error signing out: ", error);
      Alert.alert("Something Went Wrong", "We couldn't sign you out. Please try again.");
      return;
    }

    replaceNavigation.replace("Auth");
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable onPress={signOut} style={{ paddingHorizontal: 15, paddingVertical: 10, backgroundColor: "red", borderRadius: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>{`isOnline: ${isOnline}, isReach: ${isInternetReachable}, isCon: ${isConnected}`}</Text>

      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({})