import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native'
import { DriverAppNavigationProp } from '../../../Navigation/RootNavigation';

export default function Home() {
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
        <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>Sign Out</Text>

      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({})