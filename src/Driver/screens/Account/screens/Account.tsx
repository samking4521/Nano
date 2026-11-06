import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import UserDisplay from '../components/UserDisplay'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp } from '../../../../Navigation/DriverNavigation'
import { useDriverStore } from '../../../store/DriverStore'
import * as Notifications from 'expo-notifications';
import { supabase } from '../../../../lib/supabase'
import { AuthNavigationProp } from '../../../../Navigation/RootNavigation'
import { useState } from 'react'
import NanoLoadingSpinner from '../../../../utils/nanoLoadingSpinner'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { USER_ROLES } from '../../../../constants/shared_user'
import { signUpDataStorage } from '../../../../localStorage/signUpDataStorage'
import { getShipperGlobalDetails } from '../../../../utils/getShipperGlobalDetails'

const movingTruck = require("../../../../../assets/move_truck.png")

export default function Account() {
  const session = useAuthStore((store) => store.session)
  const driverVerificationStatus = useDriverStore((store) => store.driverVerificationStatus)
  const isOwnerAllVehiclesApproved = useDriverStore((store) => store.isOwnerAllVehiclesApproved)
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

  const navigation = useNavigation<DriverNavigationProp>();
  const replaceNavigation = useNavigation<AuthNavigationProp>();

  const navigateToDriverProfile = () => {
    navigation.navigate("Profile");
  }

  const navigateToVehicle = () => {
    navigation.navigate("Vehicle");
  }

  const signOutDialog = () => {
    Alert.alert(
      'Signing Out?',
      'You’re about to sign out of Nano. You can always come back whenever you’re ready.',
      [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOutDriver,
        },
      ]
    );
  }

  const switchToShipperDialog = () => {
    Alert.alert(
      'Switch to Shipper?',
      'Are you sure you want to switch to Shipper mode? You will be able to create and manage order requests as a shipper.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Switch',
          onPress: switchToShipper,
        },
      ]
    );
  }

  const switchToShipper = async () => {
    try {
      setShowLoadingSpinner(true);

      const projectId = '8f27acf1-4733-4d2d-a93f-97388681900f';

      let expoPushToken: string | null = null;

      try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        expoPushToken = tokenResponse.data;
      } catch (error) {
        console.log('Unable to retrieve Expo push token:', error);
      }

      const { data, error } = await supabase.rpc('switch_to_shipper', {
        p_expo_push_token: expoPushToken,
      });

      if (error) {
        throw error;
      }

      if (data.has_shipper_profile) {
        await getShipperGlobalDetails(session);
        replaceNavigation.navigate('Shipper');
      } else {
        signUpDataStorage.set("user_role", USER_ROLES.SHIPPER);
        replaceNavigation.navigate('Onboard', {
          mobileNo: data.phone,
          email: data.email,
          country: data.country,
          countryCode: data.countryCode,
          callingCode: data.callingCode,
          user_role: USER_ROLES.SHIPPER,
        });
      }

    } catch (e) {
      console.log('Error switching to shipper:', e);
      Alert.alert(
        'Unable to Switch to Shipper',
        "We couldn't switch your account to Shipper mode. Please check your internet connection and try again.",
        [{ text: 'OK' }]
      );
    } finally {
      setShowLoadingSpinner(false);
    }
  };

  const signOutDriver = async () => {
    try {
      setShowLoadingSpinner(true);
      const projectId = '8f27acf1-4733-4d2d-a93f-97388681900f';

      let expoPushToken: string;


      const tokenResponse = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      expoPushToken = tokenResponse.data;

      const { error: updateError } = await supabase
        .from('Device_Tokens')
        .update({ is_active: false })
        .eq('expo_push_token', expoPushToken);

      if (updateError) {
        console.log('Error updating device token:', updateError.message);
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut({
        scope: "global"
      });

      if (signOutError) {
        const { error: rollbackError } = await supabase
          .from('Device_Tokens')
          .update({ is_active: true })
          .eq('expo_push_token', expoPushToken);

        if (rollbackError) {
          console.log('Device token rollback failed:', rollbackError.message);
        }

        console.log('Error signing out:', signOutError.message);
        return;
      }

      replaceNavigation.replace('Auth');

    } catch (e) {
      console.log("Error: ", e);
      Alert.alert(
        'Sign Out Failed',
        'Unable to sign out due to a network error. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setShowLoadingSpinner(false);
    }
  };

  const isDriverProfileVerified = driverVerificationStatus == "APPROVED"

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.body}>
        <UserDisplay />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

          <Pressable onPress={switchToShipperDialog} style={styles.card}>
            <View style={styles.cardTextCont}>
              <Text style={styles.cardHeaderText}>Need to move goods?</Text>
              <Text style={styles.cardDescText}>Switch to Shipper app to book a truck and get your delivery moving.</Text>
            </View>
            <View style={styles.cardImgCont}>
              <Image source={movingTruck} style={styles.truckImg} />
            </View>
          </Pressable>

          <View style={{ marginTop: 15 }}>
            <Pressable onPress={navigateToDriverProfile} style={styles.accountLabelCont}>
              <View style={styles.accountLabelIconTextCont}>
                <Ionicons name="person-outline" size={24} color={Colors.text.gray} />
                <Text style={styles.labelText}>Profile</Text>
              </View>
              {!isDriverProfileVerified && <Ionicons name="alert-circle" size={20} color={Colors.error} style={{ marginRight: 15 }} />}
              <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
            </Pressable>

            <Pressable onPress={navigateToVehicle} style={styles.accountLabelCont}>
              <View style={styles.accountLabelIconTextCont}>
                <Ionicons name="car-outline" size={24} color={Colors.text.gray} />
                <Text style={styles.labelText}>Vehicle</Text>
              </View>
              {!isOwnerAllVehiclesApproved && <Ionicons name="alert-circle" size={20} color={Colors.error} style={{ marginRight: 15 }} />}
              <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
            </Pressable>

            <View style={styles.accountLabelCont}>
              <View style={styles.accountLabelIconTextCont}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.text.gray} />
                <Text style={styles.labelText}>Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
            </View>

            <View style={styles.accountLabelCont}>
              <View style={styles.accountLabelIconTextCont}>
                <Ionicons name="help-circle-outline" size={24} color={Colors.text.gray} />
                <Text style={styles.labelText}>Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
            </View>

            <View style={styles.accountLabelCont}>
              <View style={styles.accountLabelIconTextCont}>
                <Ionicons name="star-outline" size={24} color={Colors.text.gray} />
                <Text style={styles.labelText}>Ratings & Reviews</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
            </View>

            <View style={styles.accountLabelCont}>
              <View style={styles.accountLabelIconTextCont}>
                <Ionicons name="trophy-outline" size={24} color={Colors.text.gray} />
                <Text style={styles.labelText}>Performance & Badges</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
            </View>

            <View style={styles.accountLabelCont}>
              <View style={styles.accountLabelIconTextCont}>
                <Ionicons name="document-text-outline" size={24} color={Colors.text.gray} />
                <Text style={styles.labelText}>Legal & About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
            </View>

            <Pressable onPress={signOutDialog} style={[styles.accountLabelCont, { borderBottomWidth: undefined, borderBottomColor: undefined }]}>
              <View style={styles.accountLabelIconTextCont}>
                <Ionicons name="log-out-outline" size={24} color={Colors.text.gray} />
                <Text style={styles.labelText}>Sign Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
            </Pressable>
          </View>
        </ScrollView>
      </View>
      {showLoadingSpinner && <Pressable onPress={() => { return }} style={styles.fillScreen}>
        <NanoLoadingSpinner />
      </Pressable>}

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: 15
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 10,
    marginTop: 15,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },

      android: {
        elevation: 4,
      },
    }),
  },
  cardTextCont: {
    flexShrink: 1,
    gap: 5,
  },
  cardHeaderText: {
    fontSize: FONT_SIZES.sm,
    color: Colors.text.black,
    fontFamily: FONTS.semiBold,
  },
  cardDescText: {
    fontSize: FONT_SIZES.sm,
    color: Colors.text.gray,
    fontFamily: FONTS.regular,
  },
  cardImgCont: {
    width: 100,
    height: 100,
    marginLeft: 5,
  },
  truckImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain"
  },
  accountLabelCont: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderColor
  },
  accountLabelIconTextCont: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: "auto",
    gap: 15

  },
  labelText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: Colors.text.black
  },
  fillScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
})