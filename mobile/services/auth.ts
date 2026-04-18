import { api } from "./api";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    cid: string;
    healthId: string;
    phone: string;
    email: string;
    role: string;
    dob: string;
    bloodType: string;
    location: string;
    avatar: string | null;
    allergies: string[];
    emergencyContactName: string | null;
    emergencyContactRelation: string | null;
    emergencyContactPhone: string | null;
  };
};

export async function login(phone: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/api/auth/login", { phone, password });
}

export async function register(data: {
  name: string;
  cid: string;
  phone: string;
  email?: string;
  password: string;
  dob?: string;
  bloodType?: string;
  location?: string;
  role?: string;
}): Promise<AuthResponse> {
  return api.post<AuthResponse>("/api/auth/register", data);
}
