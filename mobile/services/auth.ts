import { api } from "./api";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
  };
};

export async function login(phone: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/api/auth/login", { phone, password });
}

export async function register(data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: string;
  profile?: Record<string, unknown>;
}): Promise<AuthResponse> {
  return api.post<AuthResponse>("/api/auth/register", data);
}

export async function verifyToken(token: string): Promise<{ user: AuthResponse["user"] }> {
  return api.get<{ user: AuthResponse["user"] }>("/api/auth/me", token);
}
