import { Session } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase";
import { useShipperStore } from "../Shipper/store/ShipperStore";
import { USER_ROLES } from "../constants/shared_user";


const getShipperDetails = async (session: Session | null) => {
    const { data: select_shipper_data, error: select_shipper_data_err } = await supabase
        .from("Shipper")
        .select("firstname, lastname, profile_photo_key")
        .eq("id", session?.user.id)
        .single();

    if (select_shipper_data_err) {
        throw new Error(`Error querying Shipper: ${select_shipper_data_err.message}`)
    }

    const setShipperFirstName =
        useShipperStore.getState().setShipperFirstName;
    const setShipperLastName =
        useShipperStore.getState().setShipperLastName;
    const setShipperImgKey =
        useShipperStore.getState().setShipperImgKey;


    setShipperFirstName(select_shipper_data.firstname);
    setShipperLastName(select_shipper_data.lastname);
    setShipperImgKey(select_shipper_data.profile_photo_key)

}


const hasUnreadNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('Notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('app_role', USER_ROLES.SHIPPER)
    .is('read_at', null)
    .limit(1)
    .maybeSingle();

  const setHasUnreadNotifications =
    useShipperStore.getState().setHasUnreadNotifications;

  if (error) {
    console.log('Failed to check unread notifications:', error);
    setHasUnreadNotifications(false);
    return;
  }

  setHasUnreadNotifications(!!data);
};

export const getShipperGlobalDetails = async (session: Session | null) => {
    await Promise.all([
        getShipperDetails(session),
        hasUnreadNotifications(session?.user.id as string)
    ])
}