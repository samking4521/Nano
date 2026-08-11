import { supabase } from "../lib/supabase";

export const checkFileExists = async (bucket: string, folderPath: string, fileName: string, type: string) => {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .list(folderPath);

  if (error) {
    throw new Error(`Error checking if ${type} exists: ${error.message}`);
  }

  return data?.some((file) => file.name === fileName) ?? null;
};