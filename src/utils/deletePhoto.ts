import { supabase } from "../lib/supabase";
import { checkFileExists } from "./imageExistsChecker";

export const deleteFileIfExists = async (
  bucket: string,
  folderPath: string,
  fileName: string,
  label: string
) => {
  const exists = await checkFileExists(bucket, folderPath, fileName, label);
  console.log(`${label} exists:`, exists);

  if (!exists) return;

  const { data: removeData, error } = await supabase.storage.from(bucket).remove([`${folderPath}/${fileName}`]);
  if (error) {
    throw new Error(`Error deleting ${label}: ${error.message}`);
  }
  console.log("Remove result:", removeData, error);
  console.log(`${label} deleted successfully`);
};