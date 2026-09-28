import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import UserDisplay from '../components/UserDisplay'
import { FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp } from '../../../../Navigation/DriverNavigation'
import { useDriverStore } from '../../../store/DriverStore'

const movingTruck = require("../../../../../assets/move_truck.png")

export default function Account() {
  const driver_store = useDriverStore((store)=> store)
  const navigation = useNavigation<DriverNavigationProp>();

  const navigateToDriverProfile = ()=>{
       navigation.navigate("Profile");
  }

  const navigateToVehicle = ()=> {
    navigation.navigate("Vehicle");
  }

  const isDriverProfileVerified = driver_store.driverVerificationStatus == "APPROVED"
  const isVehicleStatusVerified = driver_store.vehicleVerificationStatus == "APPROVED"

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.body}>
        <UserDisplay />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <View style={styles.cardTextCont}>
            <Text style={styles.cardHeaderText}>Need to move goods?</Text>
            <Text style={styles.cardDescText}>Switch to Shipper app to book a truck and get your delivery moving.</Text>
          </View>
          <View style={styles.cardImgCont}>
            <Image source={movingTruck} style={styles.truckImg} />
          </View>
        </View>

        <View style={{ marginTop: 15 }}>
          <Pressable onPress={navigateToDriverProfile} style={styles.accountLabelCont}>
            <View style={styles.accountLabelIconTextCont}>
              <Ionicons name="person-outline" size={24} color={Colors.text.gray} />
              <Text style={styles.labelText}>Profile</Text>
            </View>
            { !isDriverProfileVerified && <Ionicons name="alert-circle" size={20} color={Colors.error} style={{marginRight: 15}}/>}
            <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
          </Pressable>

          <Pressable onPress={navigateToVehicle} style={styles.accountLabelCont}>
            <View style={styles.accountLabelIconTextCont}>
              <Ionicons name="car-outline" size={24} color={Colors.text.gray} />
              <Text style={styles.labelText}>Vehicle</Text>
            </View>
            { !isVehicleStatusVerified && <Ionicons name="alert-circle" size={20} color={Colors.error} style={{marginRight: 15}}/>}
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

          <View style={[styles.accountLabelCont, { borderBottomWidth: undefined, borderBottomColor: undefined }]}>
            <View style={styles.accountLabelIconTextCont}>
              <Ionicons name="log-out-outline" size={24} color={Colors.text.gray} />
              <Text style={styles.labelText}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.gray} />
          </View>
        </View>
      </ScrollView>
       </View>
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
  }
})