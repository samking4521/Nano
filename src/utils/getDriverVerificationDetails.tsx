import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { USER_ROLES, VERIFICATION_STATUS } from "../constants/shared_user";
import { ONLINE_STATUS } from "../constants/driver";
import { useDriverStore } from "../Driver/store/DriverStore";





const getDriverDetails = async (session: Session | null, setDriverFirstName: (first_name: string) => void, setDriverLastName: (last_name: string) => void, setDriverImgKey: (key: string) => void, setDriverOnlineStatus: (status: ONLINE_STATUS) => void) => {
  const { data: select_driver_data, error: select_driver_data_err } = await supabase
    .from("Driver")
    .select("firstname, lastname, driver_img_key, online_status")
    .eq("id", session?.user.id)
    .single();

  if (select_driver_data_err) {
    throw new Error(`Error querying Driver: ${select_driver_data_err.message}`)
  }

  if (!select_driver_data) return

  console.log("getDriverVerificationDetails - driver details retrieved")

  setDriverFirstName(select_driver_data.firstname);
  setDriverLastName(select_driver_data.lastname);
  setDriverImgKey(select_driver_data.driver_img_key);
  setDriverOnlineStatus(select_driver_data.online_status);

  console.log("getDriverVerificationDetails - driver details saved to zustand")
}

const getCanDriverGoLive = async (session: Session | null, setDriverVerificationStatus: (status: VERIFICATION_STATUS | undefined) => void, setIsDriverAssignedToAVehicle: (state: boolean) => void) => {
  const { data: select_driver_verification_data, error: select_driver_verification_data_err } = await supabase
    .from("Driver_Verification")
    .select("verification_status")
    .eq("driver_id", session?.user.id)
    .single();

  if (select_driver_verification_data_err) {
    throw new Error(`Error querying Driver Verification: ${select_driver_verification_data_err.message}`)
  }

  if (!select_driver_verification_data) return

  console.log("getDriverVerificationDetails - driver verification status retrieved")


  setDriverVerificationStatus(select_driver_verification_data.verification_status);

  console.log("getDriverVerificationDetails - driver verification status saved to zustand")


  const { data: select_current_driver, error: select_current_driver_err } = await supabase
    .from("Vehicle")
    .select("id")
    .eq("current_driver_id", session?.user.id)
    .maybeSingle();

  if (select_current_driver_err) {
    throw new Error(`Error querying current driver: ${select_current_driver_err.message}`)
  }



  if (!select_current_driver) {

    setIsDriverAssignedToAVehicle(false);
    console.log("getDriverVerificationDetails - driver is not assigned to a vehicle, saved to zustand")

  } else {
    const { data: vehicle_verification, error: vehicle_verification_err } = await supabase
      .from("Vehicle_Verification")
      .select("verification_status")
      .eq("vehicle_id", select_current_driver.id)
      .single();

    if (vehicle_verification_err) {
      throw new Error(`Error querying vehicle verification: ${vehicle_verification_err.message}`)
    }

    const isDriverAssigned = vehicle_verification.verification_status === VERIFICATION_STATUS.APPROVED
    setIsDriverAssignedToAVehicle(isDriverAssigned);
    console.log(isDriverAssigned ? "getDriverVerificationDetails - driver is assigned to a vehicle, saved to zustand" : "getDriverVerificationDetails - driver is not assigned to a vehicle, saved to zustand")

  }



}


const checkOwnersVehiclesAllApproved = async (session: Session | null, setIsOwnerAllVehiclesApproved: (state: boolean) => void) => {
  const { data: select_vehicle, error: select_vehicle_err } = await supabase
    .from("Vehicle")
    .select("id")
    .eq("owner_driver_id", session?.user.id)


  if (select_vehicle_err) {
    throw new Error(`Error querying if Driver owns a vehicle: ${select_vehicle_err.message}`)
  }

  const isOwnerDriver = (select_vehicle.length ?? 0) > 0;

  if (isOwnerDriver) {
    const vehicleIds = select_vehicle.map((v) => v.id);

    const { data: select_vehicle_verification_data, error: select_vehicle_verification_data_err } = await supabase
      .from("Vehicle_Verification")
      .select("verification_status")
      .in("vehicle_id", vehicleIds)
      .neq("verification_status", VERIFICATION_STATUS.APPROVED);

    if (select_vehicle_verification_data_err) {
      throw new Error(`Error querying vehicle verification: ${select_vehicle_verification_data_err.message}`);
    }

    const hasUnapprovedVehicle = (select_vehicle_verification_data?.length ?? 0) > 0;

    console.log("getDriverVerificationDetails - driver is the vehicle owner retrived")

    const { count, error: isDriverAssigned_err } = await supabase
      .from("Vehicle")
      .select("*", { count: "exact", head: true })
      .in("id", vehicleIds)
      .not("current_driver_id", "is", null);

    if (isDriverAssigned_err) {
      throw new Error(`Error querying to see if at least one driver exists: ${isDriverAssigned_err.message}`);
    }

    const hasAssignedDriver = (count ?? 0) > 0;

    const vehicleVerified = (!hasUnapprovedVehicle && hasAssignedDriver) ? true : false;
    setIsOwnerAllVehiclesApproved(vehicleVerified)

    console.log("getDriverVerificationDetails - vehicle verification status saved to zustand")

  } else {

    console.log("getDriverVerificationDetails - driver is hired")

    const { data: select_current_driver, error: select_current_driver_err } = await supabase
      .from("Vehicle")
      .select("id")
      .eq("current_driver_id", session?.user.id)
      .maybeSingle();

    if (select_current_driver_err) {
      throw new Error(`Error querying current driver: ${select_current_driver_err.message}`)
    }


    if (select_current_driver) {
      setIsOwnerAllVehiclesApproved(true)
    } else {
      setIsOwnerAllVehiclesApproved(false)
    }

    console.log("getDriverVerificationDetails - vehicle verification status saved to zustand")
  }
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

  const setHasUnreadNotifications =
    useDriverStore.getState().setHasUnreadNotifications;

  if (error) {
    console.log('Failed to check unread notifications:', error);
    setHasUnreadNotifications(false);
    return;
  }

  setHasUnreadNotifications(!!data);
};

export const getDriverVerificationDetails = async (session: Session | null) => {

  const setDriverVerificationStatus = useDriverStore.getState().setDriverVerificationStatus;
  const setDriverFirstName = useDriverStore.getState().setDriverFirstName;
  const setDriverOnlineStatus = useDriverStore.getState().setDriverOnlineStatus;
  const setDriverLastName = useDriverStore.getState().setDriverLastName;
  const setDriverImgKey = useDriverStore.getState().setDriverImgKey;
  const setIsDriverAssignedToAVehicle = useDriverStore.getState().setIsDriverAssignedToAVehicle;
  const setIsOwnerAllVehiclesApproved = useDriverStore.getState().setIsOwnerAllVehiclesApproved;

  await Promise.all([
    getDriverDetails(session, setDriverFirstName, setDriverLastName, setDriverImgKey, setDriverOnlineStatus),
    getCanDriverGoLive(session, setDriverVerificationStatus, setIsDriverAssignedToAVehicle),
    checkOwnersVehiclesAllApproved(session, setIsOwnerAllVehiclesApproved),
    hasUnreadNotifications(session?.user.id as string)
  ])

}