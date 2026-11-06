import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
    BORDER_RADIUS,
    FONT_SIZES,
    FONTS,
} from '../../../../constants/theme/font';
import { Colors } from '../../../../constants/theme/colors';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    clamp,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { supabase } from '../../../../lib/supabase';
import { ONLINE_STATUS } from '../../../../constants/driver';
import { useAuthStore } from '../../../../Authentication/store/authStore';
import { isNetworkError } from '../../../../utils/networkError';
import { goOnlineErrorType } from '../screens/Home';
import { useDriverStore } from '../../../store/DriverStore';

const INDICATOR_SIZE = 20;
const CONTAINER_PADDING = 2;
const INNER_CONT_WIDTH = 40;
const MAX_TRANSLATE_X = INNER_CONT_WIDTH - CONTAINER_PADDING * 2 - INDICATOR_SIZE;


type GoOnlineProps = {
    showToggleOnlineStatusError: (value: goOnlineErrorType | null) => void
}

export default function GoOnline({ showToggleOnlineStatusError }: GoOnlineProps) {
    const session = useAuthStore((store) => store.session);
    const driverOnlineStatus = useDriverStore((store) => store.driverOnlineStatus);



    const [isOnline, setIsOnline] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const translationX = useSharedValue(0);
    const startX = useSharedValue(0);
    const maxTranslateX = useSharedValue(0);
    const isOnlineShared = useSharedValue(false);
    const isUpdatingShared = useSharedValue(false);


    const updateToggleToOnline = () => {
        setIsOnline(true);
        isOnlineShared.value = true;
        translationX.value = withSpring(MAX_TRANSLATE_X);
    }

    useEffect(()=> {
        if(driverOnlineStatus === ONLINE_STATUS.OFFLINE) return;
         updateToggleToOnline();
    }, [driverOnlineStatus]);

    const persistStatus = async (status: boolean) => {
        try {
            const { error } = await supabase
                .from('Driver')
                .update({
                    online_status: status
                        ? ONLINE_STATUS.ONLINE
                        : ONLINE_STATUS.OFFLINE,
                })
                .eq('id', session?.user.id);

            if (error) {
                throw new Error(`Error updating driver online status: ${error.message}`);
            }

        } catch (error) {
            console.log('Error updating driver online status:', error);

            const previousStatus = !status;

            setIsOnline(previousStatus);
            isOnlineShared.value = previousStatus;

            translationX.value = withSpring(
                previousStatus ? maxTranslateX.value : 0,
            );

            if (isNetworkError(error)) {
                showToggleOnlineStatusError("network");
            } else if (previousStatus) {
                showToggleOnlineStatusError("offline");
            } else {
                showToggleOnlineStatusError("status");
            }

        } finally {
            setUpdatingStatus(false);
            isUpdatingShared.value = false;
        }
    };

    const requestStatusUpdate = (status: boolean) => {
        setIsOnline(status);
        setUpdatingStatus(true);
        persistStatus(status);
    };

    const setOnlineState = (status: boolean) => {
        'worklet';

        if (isUpdatingShared.value || status === isOnlineShared.value) {
            return;
        }

        isOnlineShared.value = status;

        translationX.value = withSpring(
            status ? maxTranslateX.value : 0,
        );

        isUpdatingShared.value = true;
        runOnJS(requestStatusUpdate)(status);
    };

    const pan = Gesture.Pan()
        .enabled(!updatingStatus)
        .minDistance(5)
        .onStart(() => {
            startX.value = translationX.value;
        })
        .onUpdate((event) => {
            if (isUpdatingShared.value) {
                return;
            }

            translationX.value = clamp(
                startX.value + event.translationX,
                0,
                maxTranslateX.value,
            );
        })
        .onEnd(() => {
            const nextStatus =
                translationX.value >= maxTranslateX.value / 2;

            setOnlineState(nextStatus);
        });

    const tap = Gesture.Tap()
        .enabled(!updatingStatus)
        .maxDuration(250)
        .maxDistance(5)
        .onEnd((_event, success) => {
            if (success) {
                setOnlineState(!isOnlineShared.value);
            }
        });

    const gesture = Gesture.Exclusive(pan, tap);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translationX.value }],
        backgroundColor: Colors.text.white,
    }));

    const trackStyle = useAnimatedStyle(() => ({
        backgroundColor: isOnlineShared.value
            ? Colors.green
            : '#9CA3AF',
    }));

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[styles.innerContainer, trackStyle]}
                    onLayout={(event) => {
                        const width = event.nativeEvent.layout.width;

                        maxTranslateX.value = Math.max(
                            0,
                            width - CONTAINER_PADDING * 2 - INDICATOR_SIZE,
                        );

                        translationX.value = isOnlineShared.value
                            ? maxTranslateX.value
                            : 0;
                    }}
                >
                    <Animated.View
                        style={[styles.indicator, indicatorStyle]}
                    />
                </Animated.View>
            </GestureDetector>

            {updatingStatus ? (
                <ActivityIndicator
                    size="small"
                    color={Colors.text.gray}
                />
            ) : (
                <Text
                    style={[
                        styles.onlineStatusText,
                        isOnline && styles.onlineText,
                    ]}
                >
                    {isOnline ? 'Online' : 'Offline'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.round,
        padding: 2,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    innerContainer: {
        backgroundColor: '#9CA3AF',
        borderRadius: BORDER_RADIUS.round,
        width: 40,
        padding: CONTAINER_PADDING,
        overflow: 'hidden',
    },
    indicator: {
        width: INDICATOR_SIZE,
        height: INDICATOR_SIZE,
        borderRadius: INDICATOR_SIZE / 2,
        backgroundColor: Colors.text.white,
    },
    onlineStatusText: {
        color: Colors.text.gray,
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
    },
    onlineText: {
        color: '#22C55E',
    },
});