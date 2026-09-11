import * as ImagePicker from 'expo-image-picker';

/**
 * A picture chosen on the device, on its way to the server.
 *
 * The URI is the picker's own cache path. Nothing is copied into the app's
 * storage — the file goes straight from here to the upload.
 */
export type ImageUpload = {
  uri: string;
  name: string;
  /** MIME type, e.g. `image/jpeg`. The server checks the bytes as well. */
  type: string;
};

export type PickResult =
  | { ok: true; image: ImageUpload }
  | { ok: false; reason: 'cancelled' | 'denied' | 'failed' };

/**
 * Recompressed on the way out. A modern phone camera file is several megabytes,
 * the server refuses anything over eight, and none of that detail survives
 * being drawn at avatar or cover size.
 */
const QUALITY = 0.8;

/**
 * Open the photo library, let the user crop to `aspect`, and hand back the file.
 */
export async function pickImage(options: {
  aspect: [number, number];
  namePrefix: string;
}): Promise<PickResult> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { ok: false, reason: 'denied' };

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: options.aspect,
      quality: QUALITY,
    });
    if (result.canceled || !result.assets?.length) return { ok: false, reason: 'cancelled' };

    const asset = result.assets[0];
    return {
      ok: true,
      image: {
        uri: asset.uri,
        name: asset.fileName || `${options.namePrefix}-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      },
    };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

/** Square, matching the goal card and the profile avatar. */
export function pickGoalImage(): Promise<PickResult> {
  return pickImage({ aspect: [1, 1], namePrefix: 'goal' });
}

export function pickAvatarImage(): Promise<PickResult> {
  return pickImage({ aspect: [1, 1], namePrefix: 'avatar' });
}

/** Wide crop for the profile banner. */
export function pickCoverImage(): Promise<PickResult> {
  return pickImage({ aspect: [16, 9], namePrefix: 'cover' });
}
