import { request, type ApiResult } from '@/src/api/client';
import type { Goal } from '@/src/types';

/** A picture chosen on the device, on its way to the server. */
export type GoalImageUpload = {
  uri: string;
  name: string;
  /** MIME type, e.g. `image/jpeg`. The server checks the bytes as well. */
  type: string;
};

export type GoalInput = {
  name: string;
  target: number;
  saved?: number;
  /** ISO date string. */
  deadline: string;
  icon?: string;
  color?: string;
};

/**
 * Goals are sent as multipart whenever a picture goes with them, so the record
 * and its image arrive in one request rather than the app having to create a
 * goal and then patch a file onto it.
 *
 * React Native's FormData takes `{ uri, name, type }` where a browser would
 * take a File — the bytes are read from the device path at send time, so the
 * image is never loaded into JavaScript memory.
 */
function toFormData(
  fields: Record<string, string | number | boolean | undefined>,
  image?: GoalImageUpload | null
): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  if (image) {
    // The cast is the documented React Native shape; the DOM types this file is
    // checked against only know about Blob.
    form.append('image', { uri: image.uri, name: image.name, type: image.type } as unknown as Blob);
  }
  return form;
}

export function fetchServerGoals(token: string): Promise<ApiResult<{ goals: Goal[] }>> {
  return request('/api/goals', { token });
}

export function createServerGoal(
  token: string,
  data: GoalInput & { id?: string },
  image?: GoalImageUpload | null
): Promise<ApiResult<{ goal: Goal }>> {
  // Sent as JSON when there is no picture: it is the cheaper request, and the
  // server accepts either.
  const body = image ? toFormData({ ...data }, image) : data;
  return request('/api/goals', { method: 'POST', body, token });
}

export function updateServerGoal(
  token: string,
  id: string,
  data: Partial<GoalInput> & { removeImage?: boolean },
  image?: GoalImageUpload | null
): Promise<ApiResult<{ goal: Goal }>> {
  const body = image ? toFormData({ ...data }, image) : data;
  return request(`/api/goals/${encodeURIComponent(id)}`, { method: 'PATCH', body, token });
}

/** Resolves with no body — the server answers 204. */
export function deleteServerGoal(token: string, id: string): Promise<ApiResult<undefined>> {
  return request(`/api/goals/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}
