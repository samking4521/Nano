import { StyleSheet, Text, View } from 'react-native'
import { VERIFICATION_STATUS } from '../../../../constants/shared_user'
import { BORDER_RADIUS, FONT_SIZES, FONTS } from '../../../../constants/theme/font'
import { Colors } from '../../../../constants/theme/colors'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { goOnlineErrorType } from '../screens/Home'

type GoOnlineErrorViewProps = {
    driverVerificationStatus: VERIFICATION_STATUS | undefined,
    showGoOnlineError: goOnlineErrorType
    setShowGoOnlineError: React.Dispatch<React.SetStateAction<goOnlineErrorType | null>>
}

export default function GoOnlineErrorView({ driverVerificationStatus, showGoOnlineError, setShowGoOnlineError }: GoOnlineErrorViewProps) {

    const headerErrorText = showGoOnlineError == "network" ? "Network Error" : showGoOnlineError == "offline" ? "Unable to go offline" : "Unable to go online";
    const headerErrorDesc = showGoOnlineError == "network" ? "Connection failed. Check your internet and try again." : showGoOnlineError == "offline" ? "Connection failed. Check your internet and try again." : driverVerificationStatus !== VERIFICATION_STATUS.APPROVED ? "Your driver account is pending approval. You can go online once verified." : "You must be assigned to an approved vehicle before going online.";

    return (
        <View style={styles.container}>
            <View style={styles.body}>
                <View style={styles.errorAlertContainer}>
                    <Ionicons name="alert-circle" color={Colors.error} size={30} />
                    <View style={{ gap: 5, flexShrink: 1 }}>
                        <Text style={styles.headerText}>{headerErrorText}</Text>
                        <Text style={styles.headerDesc}>{headerErrorDesc}</Text>
                    </View>
                    <AntDesign onPress={() => setShowGoOnlineError(null)} name="close" color={Colors.text.gray} size={18} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 15,
        zIndex: 1000
    },
    body: {
        flex: 1,
        justifyContent: "flex-end",
        paddingBottom: 10
    },
    headerText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.black
    },
    headerDesc: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray,
        lineHeight: 20
    },
    errorAlertContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        backgroundColor: Colors.errorBackground,
        padding: 10,
        borderRadius: BORDER_RADIUS.md,
        gap: 10
    }
})