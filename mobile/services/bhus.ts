import { api } from "./api";

export type BHUStatus = "Active" | "Inactive";

export type BHUPayload = {
  name: string;
  addressLine: string;
  dzongkhag: string;
  gewog: string;
  telephone: string;
  email: string;
  status?: BHUStatus;
};

export type BHU = BHUPayload & {
  id: string;
  status: BHUStatus;
  createdAt: string;
  updatedAt: string;
};

export function createBHU(data: BHUPayload, token: string) {
  return api.post<{ bhu: BHU }>("/api/bhus", data, token);
}

export function getBHUs(token: string) {
  return api.get<{ bhus: BHU[] }>("/api/bhus", token);
}
