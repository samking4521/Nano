import * as ImageManipulator from "expo-image-manipulator";
import { File } from "expo-file-system";
import { Image } from "react-native";

export type CompressionResult = {
  uri: string;
  size: number;
  quality: number;
};

type CompressOptions = {
  maxSizeBytes: number;
  maxWidth?: number;
  minWidth?: number;
  initialQuality?: number;
  minQuality?: number;
};

function getImageSize(
  uri: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject
    );
  });
}

async function compress(
  uri: string,
  maxWidth: number,
  quality: number
): Promise<CompressionResult> {
  const { width: originalWidth } = await getImageSize(uri);

  const actions: ImageManipulator.Action[] =
    originalWidth > maxWidth
      ? [{ resize: { width: maxWidth } }]
      : [];

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  const file = new File(result.uri);

  return {
    uri: result.uri,
    size: file.exists ? file.size ?? 0 : 0,
    quality,
  };
}

export async function CompressToLimit(
  uri: string,
  {
    maxSizeBytes,
    maxWidth = 1600,
    minWidth = 800,
    initialQuality = 0.9,
    minQuality = 0.5,
  }: CompressOptions
): Promise<CompressionResult> {
  const originalFile = new File(uri);

  if (!originalFile.exists) {
    throw new Error("Image does not exist.");
  }

  const originalSize = originalFile.size ?? 0;

  // Always normalize to JPEG.
  // If already within the size limit, preserve high quality.
  if (originalSize <= maxSizeBytes) {
    return compress(uri, maxWidth, initialQuality);
  }

  let currentMaxWidth = maxWidth;

  while (currentMaxWidth >= minWidth) {
    let low = minQuality;
    let high = initialQuality;

    let best: CompressionResult | null = null;

    // Binary search for the highest quality within the size limit.
    while (high - low > 0.02) {
      const quality = Number(((low + high) / 2).toFixed(2));

      const candidate = await compress(
        uri,
        currentMaxWidth,
        quality
      );

      if (candidate.size <= maxSizeBytes) {
        best = candidate;
        low = quality;
      } else {
        high = quality;
      }
    }

    if (best) {
      return best;
    }

    // Reduce resolution and try again.
    currentMaxWidth = Math.floor(currentMaxWidth * 0.85);
  }

  throw new Error(
    "Unable to compress image within the requested size limit."
  );
}


// Always converts the output to JPEG.
// ✅ Never upscales smaller images.
// ✅ Only resizes when the original width exceeds maxWidth.
// ✅ Uses binary search to preserve the highest possible JPEG quality.
// ✅ Returns the original resolution for small images while still normalizing the format.
// ✅ Doesn't rely on undocumented behavior of expo-image-manipulator, making it more robust to future library changes.