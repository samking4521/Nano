import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme/colors'
import { BORDER_RADIUS, FONT_SIZES, FONTS, ICON_SIZES } from '../../../../constants/theme/font'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { DriverNavigationProp } from '../../../../Navigation/DriverNavigation'
import { supabase } from '../../../../lib/supabase'
import { useAuthStore } from '../../../../Authentication/store/authStore'
import { USER_ROLES } from '../../../../constants/shared_user'
import HexagonSpinner from '../../../../utils/HexagonSpinner'
import { DRIVER_NOTIFICATION_TYPE } from '../../../../constants/driver'
import { useDriverStore } from '../../../store/DriverStore'

export type notificationDataType = {
    id: string,
    user_id: string,
    type: string,
    title: string,
    body: string,
    data: any,
    read_at: string,
    category: string,
    created_at: string
}

function formatNotificationDate(created_at: string): string {
    const normalized = created_at
        .replace(' ', 'T')
        .replace(/\.(\d{3})\d*/, '.$1')
        .replace(/\+00$/, 'Z');

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        console.warn('Invalid notification date:', created_at, normalized);
        return '';
    }

    const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    const day = date.getDate();

    const suffix =
        day % 10 === 1 && day !== 11 ? 'st' :
            day % 10 === 2 && day !== 12 ? 'nd' :
                day % 10 === 3 && day !== 13 ? 'rd' : 'th';

    const month = date.toLocaleDateString('en-US', {
        month: 'short',
    });

    return `${time} | ${day}${suffix} ${month}`;
}

const NotificationCardInfo = ({ item, viewNotification }: { item: notificationDataType, viewNotification: (notificationId: string, notification_type: string) => void }) => {

    return (
        <Pressable onPress={() => viewNotification(item.id, item.type)} style={styles.notificationCont}>
            <View style={styles.notificationHeaderCont}>
                <View style={styles.nanoLogoCont}>
                    <View style={styles.nanoIconCont}>
                        <Text style={styles.nanoIconText}>N</Text>
                    </View>
                    {!item.read_at && <View style={styles.unreadDot} />}
                </View>

                <View style={styles.titleCont}>
                    <Text style={styles.title}>{item.title}</Text>
                </View>
            </View>

            <View style={styles.notificationDescCont}>
                <Text style={styles.notificationDescText}>{item.body}</Text>
            </View>

            <View style={styles.notificationCardFooter}>
                <Text style={styles.notificationDateTime}>{formatNotificationDate(item.created_at)}</Text>
            </View>

        </Pressable>
    )
}


const PAGE_SIZE = 20;


const EmptyNotifications = () => (
    <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
            <Feather name="bell" size={32} color={Colors.text.black} />
        </View>

        <Text style={styles.emptyTitle}>
            You're all caught up!
        </Text>

        <Text style={styles.emptyDescription}>
            You don't have any notifications yet. We'll let you know when there's something new.
        </Text>
    </View>
);

const NotificationError = ({ onRetry }: { onRetry: () => void }) => (
    <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
            <Feather name="wifi-off" size={32} color={Colors.text.black} />
        </View>

        <Text style={styles.emptyTitle}>
            Couldn't load notifications
        </Text>

        <Text style={styles.emptyDescription}>
            We're having trouble connecting. Check your internet connection and try again.
        </Text>

        <Pressable onPress={onRetry}>
            <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
    </View>
);

type errorType = "list_empty_network_err" | "list_filled_network_err"

export default function DriverNotifications() {
    const session = useAuthStore((store) => store.session);
    const notifications = useDriverStore((store) => store.notifications);
    const setNotifications = useDriverStore((store) => store.setNotifications);
    const setHasUnreadNotifications = useDriverStore((store) => store.setHasUnreadNotifications);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const navigation = useNavigation<DriverNavigationProp>();
    const pageRef = useRef(0);
    const loadingRef = useRef(false);
    const [loadingSpinner, setLoadingSpinner] = useState(false);
    const [error, setError] = useState<errorType | null>(null);

    const goBack = () => {
        navigation.goBack();
    }


    const renderItem = useCallback(({ item }: { item: notificationDataType }) => {
        return (
            <NotificationCardInfo item={item} viewNotification={viewNotification} />
        )
    }, [notifications])


    const retryQueryNotifications = () => {
        setError(null);
        setLoadingSpinner(true);
        loadMoreNotifications();
    }

    const retryLoadMoreNotifications = () => {
        setError(null);
        loadMoreNotifications();
    }


    const handleEndReached = () => {
        if (error || loadingRef.current || !hasMore) return;
        void loadMoreNotifications();
    };



    const loadMoreNotifications = async () => {
        if (loadingRef.current || !hasMore) return;

        loadingRef.current = true;
        setLoadingMore(true);

        try {
            const from = pageRef.current * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data: newNotifications, error } = await supabase
                .from('Notifications')
                .select('*')
                .eq('user_id', session?.user.id)
                .eq('app_role', USER_ROLES.DRIVER)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                throw new Error(`Error querying Driver Notifications: ${error.message}`);
            }

            if (newNotifications.length === 0) {
                setHasMore(false);
                return;
            }

            pageRef.current += 1;

            setNotifications(prev => {
                const existingIds = new Set(prev.map(item => item.id));

                const uniqueNewNotifications = newNotifications.filter(
                    item => !existingIds.has(item.id)
                );

                return [...prev, ...uniqueNewNotifications];
            });
            
            setHasMore(newNotifications.length === PAGE_SIZE);

        } catch (error) {
            console.log('Failed to load notifications:', error);
            setError(notifications.length >= 1 ? "list_filled_network_err" : "list_empty_network_err");
        } finally {
            loadingRef.current = false;
            setLoadingMore(false);
            setLoadingSpinner(false);
        }
    };


    useEffect(() => {
        setLoadingSpinner(true);
        setNotifications([]);
        loadMoreNotifications();
    }, []);


    const viewNotification = async (notificationId: string, notification_type: string) => {

        const readAt = new Date().toISOString();

        // 1. Optimistically update Zustand immediately.
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read_at: readAt }
                    : notification
            )
        );

        // Driver-specific notification routing.
        switch (notification_type) {
            case DRIVER_NOTIFICATION_TYPE.VEHICLE_VERIFICATION_APPROVED:
            case DRIVER_NOTIFICATION_TYPE.VEHICLE_VERIFICATION_ISSUE:
            case DRIVER_NOTIFICATION_TYPE.VEHICLE_LICENSE_EXPIRY:
            case DRIVER_NOTIFICATION_TYPE.VEHICLE_LICENSE_RENEWAL_APPROVED:
            case DRIVER_NOTIFICATION_TYPE.VEHICLE_LICENSE_RENEWAL_ISSUE:
                navigation.navigate('Vehicle');
                break;

            case DRIVER_NOTIFICATION_TYPE.DRIVER_VERIFICATION_ISSUE:
            case DRIVER_NOTIFICATION_TYPE.DRIVER_VERIFICATION_APPROVED:
                navigation.navigate('Profile');
                break;

            case DRIVER_NOTIFICATION_TYPE.DRIVER_LICENSE_EXPIRY:
            case DRIVER_NOTIFICATION_TYPE.DRIVER_LICENSE_RENEWAL_APPROVED:
            case DRIVER_NOTIFICATION_TYPE.DRIVER_LICENSE_RENEWAL_ISSUE:
                navigation.navigate('IdentityInfo');
                break;

            default:
                console.log('Unsupported Driver notification:', notification_type);
        }


        const { error } = await supabase
            .from('Notifications')
            .update({ read_at: readAt })
            .eq('id', notificationId)
            .eq('user_id', session?.user.id)
            .eq('app_role', USER_ROLES.DRIVER)
            .is('read_at', null);


        if (error) {
            console.log('Failed to mark notification as read:', error);
        }


        hasUnreadNotifications(session?.user.id as string);

    }


    const hasUnreadNotifications = async (userId: string) => {
        const { data, error } = await supabase
            .from('Notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('app_role', USER_ROLES.DRIVER)
            .is('read_at', null)
            .limit(1)
            .maybeSingle();


        if (error) {
            console.log('Failed to check unread notifications:', error);
            setHasUnreadNotifications(false);
            return;
        }

        setHasUnreadNotifications(!!data);
    };





    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.body}>
                <Pressable onPress={goBack} style={styles.backBtn}>
                    <Feather name="arrow-left" size={ICON_SIZES.lg} color={Colors.text.black} />
                </Pressable>

                <View style={{ marginVertical: 15 }}>
                    <Text style={styles.headerText}>Notifications</Text>
                </View>

                <View style={{ flex: 1 }}>
                    {
                        loadingSpinner ?
                            <View style={styles.loadingContainer}>
                                <HexagonSpinner />
                                <Text style={styles.loadingNotificationsText}>Loading Notifications...</Text>
                            </View>

                            :

                            error === "list_empty_network_err" && notifications.length === 0 ?

                                <NotificationError onRetry={retryQueryNotifications} />

                                :

                                notifications.length === 0 ?
                                    <EmptyNotifications />
                                    :

                                    <FlatList
                                        data={notifications}
                                        renderItem={renderItem}
                                        keyExtractor={(item) => item.id}
                                        contentContainerStyle={{ flexGrow: 1, gap: 15, paddingBottom: 100 }}
                                        showsVerticalScrollIndicator
                                        onEndReached={handleEndReached}
                                        onEndReachedThreshold={0.5}
                                        ListFooterComponent={() =>
                                            <View style={styles.footerComponentCont}>
                                                {loadingMore ? <ActivityIndicator size={"large"} color={Colors.primary} /> : error === "list_filled_network_err" ? <Text style={styles.errorLoadingMoreText}>Couldn't load more notifications. Please check your internet connection and <Text onPress={retryLoadMoreNotifications} style={styles.tryAgainText}>try again.</Text></Text> : null}
                                            </View>
                                        }
                                    />
                    }

                </View>

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
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 40,
        backgroundColor: Colors.backBtnGray,
        justifyContent: "center",
        alignItems: "center"
    },
    headerText: {
        fontSize: FONT_SIZES.xl,
        fontFamily: FONTS.semiBold,
        color: Colors.text.black
    },
    nanoLogoCont: {
        width: 25,
        height: 25,
    },
    nanoIconCont: {
        width: "100%",
        height: "100%",
        borderWidth: 3,
        borderColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 40
    },
    nanoIconText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.semiBold,
        color: Colors.primary,
        fontStyle: "italic"
    },
    unreadDot: {
        width: 10,
        height: 10,
        backgroundColor: Colors.error,
        borderRadius: 10,
        position: "absolute",
        top: 0,
        right: 0 - 3
    },
    titleCont: {
        flexShrink: 1,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.medium,
        color: Colors.text.black
    },
    notificationHeaderCont: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15
    },
    notificationDescCont: {
        flexShrink: 1,
    },
    notificationDescText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray,
        lineHeight: 20
    },
    notificationCont: {
        gap: 10,
        backgroundColor: Colors.text.white,
        borderRadius: BORDER_RADIUS.md,
        padding: 15
    },
    notificationCardFooter: {
        paddingTop: 10,
        borderTopWidth: .5,
        borderTopColor: Colors.borderColor
    },
    notificationDateTime: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        color: Colors.text.gray
    },
    footerComponentCont: {
        width: "100%",
        paddingVertical: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingNotificationsText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
        color: Colors.text.gray
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginTop: -100
    },
    errorLoadingMoreText: {
        fontSize: FONT_SIZES.xs,
        fontFamily: FONTS.medium,
        color: Colors.text.black,
        textAlign: "center"
    },
    tryAgainText: {
        textDecorationLine: "underline",
        color: Colors.primary,
        fontFamily: FONTS.semiBold
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 50,
        marginTop: -100
    },
    emptyIcon: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: Colors.text.black,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: FONT_SIZES.sm,
        color: Colors.text.gray,
        textAlign: 'center',
        lineHeight: 21,
    },
    retryText: {
        color: Colors.primary,
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.md,
        marginTop: 18,
    },


})