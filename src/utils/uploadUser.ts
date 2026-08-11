import { Session } from "@supabase/supabase-js";
import { ACCOUNT_STATUS } from "../constants/shared_user";
import { supabase } from "../lib/supabase";
import { MMKV } from "react-native-mmkv";


export const uploadUser = async (session: Session, storage: MMKV, type: string, signal: AbortSignal) => {
  const email = storage.getString("email");
  const phone = storage.getString("mobileNo");
  const country = storage.getString("country");
  if (!country) {
    return;
  }
  const countryObj = JSON.parse(country);

  const { data: select_user_data, error: select_user_data_err } = await supabase
    .from("User")
    .select("id")
    .eq("id", session?.user.id)
    .abortSignal(signal)
    .maybeSingle();

  if (select_user_data_err) {
    throw new Error(`Error querying if User exists: ${select_user_data_err.message}`)
  }

  console.log("User id: ", select_user_data?.id);



  if (!select_user_data?.id) {
    const { error } = await supabase
      .from("User")
      .insert({
        active_role: type,
        email: email,
        phone: phone,
        country_name: countryObj.countryName,
        country_code: countryObj.countryCode,
        calling_code: countryObj.callingCode,
      }).abortSignal(signal)

    if (error) {
      throw new Error(`Error uploading user ${error.message}`)
    }
    console.log("Success: User added");



  } else {
    const { error: err_update_user } = await supabase
      .from("User")
      .update({
        active_role: type,
        email: email,
          phone: phone,
          country_name: countryObj.countryName,
          country_code: countryObj.countryCode,
        calling_code: countryObj.callingCode,
       })
      .eq("id", session?.user.id).abortSignal(signal)


    if (err_update_user) {
      throw new Error(`Error updating User: ${err_update_user.message}`)
    }

        console.log("Success: User updated");

  }

  const { data: select_user_acc_status, error: select_user_acc_status_err } = await supabase
    .from("User_Account_Status")
    .select("user_id")
    .eq("user_id", session?.user.id)
    .abortSignal(signal)
    .maybeSingle();

  if (select_user_acc_status_err) {
    throw new Error(`Error querying if User_Account_Status exists: ${select_user_acc_status_err.message}`)
  }

  if (!select_user_acc_status?.user_id) {
    const { error: err } = await supabase.from("User_Account_Status").insert({
      user_id: session?.user.id,
      account_status: ACCOUNT_STATUS.ACTIVE,
    }).abortSignal(signal)

    if (err) {
      throw new Error(`Error uploading User_Account_Status: ${err.message}`)
    }

    console.log("Success: User_Account_Status added");
  }
}