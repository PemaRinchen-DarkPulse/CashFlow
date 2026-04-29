import { api } from "./api";

export type HospitalType =
  | "National Referral Hospital"
  | "Regional Referral Hospital"
  | "District Hospital"
  | "Traditional Medicine Hospital";

export type HospitalStatus = "Active" | "Inactive";

export type HospitalPayload = {
  name: string;
  type: HospitalType;
  addressLine: string;
  dzongkhag: string;
  gewog: string;
  telephone: string;
  email: string;
  status?: HospitalStatus;
};

export type Hospital = HospitalPayload & {
  id: string;
  status: HospitalStatus;
  createdAt: string;
  updatedAt: string;
};

export function createHospital(data: HospitalPayload, token: string) {
  return api.post<{ hospital: Hospital }>("/api/hospitals", data, token);
}

export function getHospitals(token: string) {
  return api.get<{ hospitals: Hospital[] }>("/api/hospitals", token);
}
