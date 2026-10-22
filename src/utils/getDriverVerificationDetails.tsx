import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { VERIFICATION_STATUS } from "../constants/shared_user";



const getDriverDetails = async (session: Session | null, setDriverFirstName: (first_name: string) => void, setDriverLastName: (last_name: string) => void, setDriverImgKey: (key: string) => void) => {
  const { data: select_driver_data, error: select_driver_data_err } = await supabase
    .from("Driver")
    .select("firstname, lastname, driver_img_key")
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

  console.log("getDriverVerificationDetails - driver details saved to zustand")
}

const getCanDriverGoLive = async (session: Session | null, setDriverVerificationStatus: (status: VERIFICATION_STATUS | undefined) => void, setCanGoLive: (state: boolean) => void) => {
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

    setCanGoLive(false);
    console.log("getDriverVerificationDetails - driver cannot go live, saved to zustand")

  } else {
    const { data: vehicle_verification, error: vehicle_verification_err } = await supabase
      .from("Vehicle_Verification")
      .select("verification_status")
      .eq("vehicle_id", select_current_driver.id)
      .single();

    if (vehicle_verification_err) {
      throw new Error(`Error querying vehicle verification: ${vehicle_verification_err.message}`)
    }

    const canGoLive = select_driver_verification_data.verification_status == VERIFICATION_STATUS.APPROVED && vehicle_verification.verification_status == VERIFICATION_STATUS.APPROVED
    setCanGoLive(canGoLive);
    console.log("getDriverVerificationDetails - driver can go or not go live, saved to zustand")

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


export const getDriverVerificationDetails = async (session: Session | null, setDriverFirstName: (first_name: string) => void, setDriverLastName: (last_name: string) => void, setDriverImgKey: (key: string) => void, setDriverVerificationStatus: (status: VERIFICATION_STATUS | undefined) => void, setCanGoLive: (state: boolean) => void, setIsOwnerAllVehiclesApproved: (state: boolean) => void) => {
  await Promise.all([
    getDriverDetails(session, setDriverFirstName, setDriverLastName, setDriverImgKey),
    getCanDriverGoLive(session, setDriverVerificationStatus, setCanGoLive),
    checkOwnersVehiclesAllApproved(session, setIsOwnerAllVehiclesApproved)
  ])

}