import { request, type ApiResult } from '@/src/api/client';
import type { ApiUser } from '@/src/api/authApi';
import type { ImageUpload } from '@/src/utils/goalImage';

function toFormData(options: {
  avatar?: ImageUpload | null;
  cover?: ImageUpload | null;
  removeAvatar?: boolean;
  removeCover?: boolean;
}): FormData {
  const form = new FormData();
  if (options.removeAvatar) form.append('removeAvatar', 'true');
  if (options.removeCover) form.append('removeCover', 'true');
  if (options.avatar) {
    form.append('avatar', {
      uri: options.avatar.uri,
      name: options.avatar.name,
      type: options.avatar.type,
    } as unknown as Blob);
  }
  if (options.cover) {
    form.append('cover', {
      uri: options.cover.uri,
      name: options.cover.name,
      type: options.cover.type,
    } as unknown as Blob);
  }
  return form;
}

/**
 * Replace or clear the profile picture and/or cover. Sent as multipart when a
 * file goes with it, JSON when the only action is a removal.
 */
export function updateServerPhotos(
  token: string,
  options: {
    avatar?: ImageUpload | null;
    cover?: ImageUpload | null;
    removeAvatar?: boolean;
    removeCover?: boolean;
  }
): Promise<ApiResult<{ user: ApiUser }>> {
  const hasFile = !!options.avatar || !!options.cover;
  const body = hasFile
    ? toFormData(options)
    : {
        ...(options.removeAvatar ? { removeAvatar: true } : {}),
        ...(options.removeCover ? { removeCover: true } : {}),
      };
  return request('/api/me/photos', { method: 'PATCH', body, token });
}
