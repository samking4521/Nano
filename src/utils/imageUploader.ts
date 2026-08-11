import { File } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';



export async function uploadToStorage(
    bucket: string,
    path: string,
    uri: string,
    contentType = 'image/jpeg'): Promise<string> {
    const file = new File(uri);
     
    if (!file.exists) {
        throw new Error('File does not exist');
    }

    const base64 = await file.base64();

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, decode(base64), {
            contentType,
            upsert: true,
        });

    if (error) {
        throw new Error(`Upload to ${bucket} failed: ${error.message}`);
    }

    console.log(`Image uploaded successfully to ${bucket}`)

    return data.path;
}