import { File } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

export async function uploadToStorage(
    bucket: string,
    path: string,
    uri: string,
    contentType = 'image/jpeg'
): Promise<string> {
    const file = new File(uri);

    if (!file.exists) {
        throw new Error('File does not exist');
    }

    const base64 = await file.base64();

    // By default, all buckets use upsert.
    let upsert = true;

    // Vehicle buckets need to determine whether this is
    // an INSERT or UPDATE because their RLS policies differ.
    const shouldCheckFileExists =
        bucket === 'vehicle-photos' ||
        bucket === 'vehicle-documents';

    if (shouldCheckFileExists) {
        const lastSlashIndex = path.lastIndexOf('/');

        const folderPath =
            lastSlashIndex === -1
                ? ''
                : path.substring(0, lastSlashIndex);

        const fileName =
            lastSlashIndex === -1
                ? path
                : path.substring(lastSlashIndex + 1);

        const { data: files, error: listError } = await supabase.storage
            .from(bucket)
            .list(folderPath);

        if (listError) {
            throw new Error(
                `Failed to check existing file in ${bucket}: ${listError.message}`
            );
        }

        const fileExists = files?.some(
            (existingFile) => existingFile.name === fileName
        );

        // Existing file → UPDATE
        // New file → INSERT
        upsert = !!fileExists;
    }

    
console.log("up: ", upsert)
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, decode(base64), {
            contentType,
            upsert,
        });

    if (error) {
        throw new Error(
            `Upload to ${bucket} failed: ${error.message}`
        );
    }

    console.log(
        `File uploaded successfully to ${bucket} (upsert: ${upsert})`
    );

    return data.path;
}