import * as ImagePicker from 'expo-image-picker';

import type { GoalImageUpload } from '@/src/api/goalsApi';

/**
 * Square, because the goal card and the form preview both show the picture in a
 * square tile. Cropping to it up front means the image is never letterboxed or
 * silently cut off later.
 */
const ASPECT: [number, number] = [1, 1];

/**
 * Recompressed on the way out. A modern phone camera file is several megabytes,
 * the server refuses anything over eight, and none of that detail survives
 * being drawn at 42 points anyway.
 */
const QUALITY = 0.8;

export type PickResult =
  | { ok: true; image: GoalImageUpload }
  | { ok: false; reason: 'cancelled' | 'denied' | 'failed' };

/**
 * Open the photo library, let the user crop, and hand back the file.
 *
 * Nothing is copied into the app's own storage. The picture belongs to the goal
 * and the goal lives on the server, so the file goes straight from the picker
 * to the upload — a local copy would only be a second, staler original to keep
 * in step.
 *
 * The URI is the picker's own cache path, which stays valid for the life of
 * this screen; it is uploaded when the goal is saved, moments later.
 */
export async function pickGoalImage(): Promise<PickResult> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { ok: false, reason: 'denied' };

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: ASPECT,
      quality: QUALITY,
    });
    if (result.canceled || !result.assets?.length) return { ok: false, reason: 'cancelled' };

    const asset = result.assets[0];
    return {
      ok: true,
      image: {
        uri: asset.uri,
        // Both are optional on the asset. The server re-derives the real type
        // from the bytes, so these only have to be sane.
        name: asset.fileName || `goal-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      },
    };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
