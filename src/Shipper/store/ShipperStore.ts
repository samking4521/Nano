import { create } from "zustand";
import { notificationDataType } from "../screens/Account/screens/Notifications";

type ShipperStore = {
    shipperImgKey: string | undefined
    shipperFirstName: string | undefined
    shipperLastName: string | undefined
    shipperImgKeyVersion: number
    setShipperImgKey: (key: string) => void
    setShipperImgKeyVersion: (value: number) => void
    setShipperFirstName: (first_name: string) => void
    setShipperLastName: (last_name: string) => void
    notifications: notificationDataType[],
    hasUnreadNotifications: boolean,
    setHasUnreadNotifications: (status: boolean) => void,
    setNotifications: (
        updater: notificationDataType[] |
            ((prev: notificationDataType[]) => notificationDataType[])
    ) => void;
};

export const useShipperStore = create<ShipperStore>((set) => (
    {
        shipperImgKey: undefined,
        shipperFirstName: undefined,
        shipperLastName: undefined,
        shipperImgKeyVersion: 0,
        setShipperImgKey: (key: string) => set({ shipperImgKey: key }),
        setShipperImgKeyVersion: (value: number) => set({ shipperImgKeyVersion: value }),
        setShipperFirstName: (first_name: string) => set({ shipperFirstName: first_name }),
        setShipperLastName: (last_name: string) => set({ shipperLastName: last_name }),
        notifications: [],
        setNotifications: (updater) =>
            set(state => ({
                notifications: typeof updater === 'function'
                    ? updater(state.notifications)
                    : updater,
            })),
        hasUnreadNotifications: false,
        setHasUnreadNotifications: (status: boolean) => set({ hasUnreadNotifications: status }),
    }
));