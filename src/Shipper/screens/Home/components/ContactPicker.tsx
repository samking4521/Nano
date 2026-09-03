import { useState } from 'react';
import { Pressable, StyleSheet, Alert, Linking, Platform, ActivityIndicator } from 'react-native';
import { requestPermissionsAsync, getPermissionsAsync, presentContactPickerAsync } from 'expo-contacts';
import { FontAwesome6 } from '@expo/vector-icons';
import { Colors } from '../../../../constants/theme/colors';

type PickedContact = {
    name: string;
    phoneNumber: string | null;
};

export function ContactPickerButton({
    onPicked,
}: {
    onPicked: (contact: PickedContact) => void;
}) {
    const [loading, setLoading] = useState(false);

    const promptOpenSettings = () => {
        const instructions = Platform.select({
            ios: 'Go to Settings → Nano → Contacts, then turn it on.',
            android: 'Go to Settings → Apps → Nano → Permissions → Contacts, then allow it.',
            default: 'Enable contacts access for Nano in your device Settings.',
        });

        Alert.alert(
            'Contacts access needed',
            `You previously denied contacts access, so Nano can't prompt you again automatically. ${instructions}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => Linking.openSettings(),
                },
            ]
        );
    };

    const handlePick = async () => {
        try {
            setLoading(true);

            // Check current status first — avoids re-prompting if already denied
            let { status, canAskAgain } = await getPermissionsAsync();

            if (status !== 'granted') {
                if (!canAskAgain) {
                    // User denied previously and the OS won't show the prompt again
                    promptOpenSettings();
                    return;
                }

                // Safe to ask — either first time, or user hasn't permanently denied
                const requestResult = await requestPermissionsAsync();
                status = requestResult.status;
                canAskAgain = requestResult.canAskAgain;

                if (status !== 'granted') {
                    if (!canAskAgain) {
                        // They just denied it in this same prompt — future asks will be silently blocked
                        promptOpenSettings();
                    } else {
                        Alert.alert(
                            'Permission needed',
                            'Nano needs contacts access to let you pick a number.'
                        );
                    }
                    return;
                }
            }

            // Opens the native OS contact picker UI
            const contact = await presentContactPickerAsync();

            if (!contact) {
                // user backed out of the picker
                return;
            }
            const name = (contact.firstName && contact.lastName)? `${contact.firstName} ${contact.lastName}` : contact.firstName? contact.firstName : contact.lastName;
            const phoneNumber = contact.phoneNumbers?.[0]?.number ?? null;

            if (!phoneNumber) {
                Alert.alert('No phone number', 'That contact has no phone number saved.');
                return;
            }

            onPicked({ name: name ?? '', phoneNumber });
        } catch (err) {
            console.error('Contact picker error:', err);
            Alert.alert('Something went wrong', 'Could not open contacts.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Pressable onPress={handlePick} disabled={loading}>
            { loading? <ActivityIndicator color={Colors.text.gray} style={styles.contactIcon}/> : <FontAwesome6 name="contact-book" size={24} color={Colors.text.black} style={styles.contactIcon} />}
            
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: '#111',
        alignItems: 'center',
    },
    label: {
        color: '#fff',
        fontWeight: '500',
    },
     contactIcon: {
        marginHorizontal: 10
    },
});