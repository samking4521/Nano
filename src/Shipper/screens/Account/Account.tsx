import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { supabase } from '../../../lib/supabase';
import { ShipperAppNavigationProp } from '../../../Navigation/RootNavigation';
import { useNavigation } from '@react-navigation/native'

export default function Account() {
   const navigation = useNavigation<ShipperAppNavigationProp>()

 async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("error: ", error);
    throw error;
  }else {
    console.log("success")
      navigation.replace("Auth");
  }
}

  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text onPress={signOut}>Account</Text>
    </View>
  )
}

const styles = StyleSheet.create({})