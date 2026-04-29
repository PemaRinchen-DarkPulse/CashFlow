const API_URL = import.meta.env.VITE_API_URL || "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export type HospitalPayload = {
  name: string;
  type: string;
  addressLine: string;
  dzongkhag: string;
  gewog: string;
  telephone: string;
  email: string;
};

export type HospitalRecord = HospitalPayload & {
  id: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
};

export type BHUPayload = {
  name: string;
  addressLine: string;
  dzongkhag: string;
  gewog: string;
  telephone: string;
  email: string;
};

export type BHURecord = BHUPayload & {
  id: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
};

export const login = async (credentials: {
  phone?: string;
  email?: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
};

export const getHospitals = async (): Promise<{
  hospitals: HospitalRecord[];
}> => {
  const response = await fetch(`${API_URL}/hospitals`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch hospitals");
  }

  return response.json();
};

export const createHospital = async (
  hospitalData: HospitalPayload,
): Promise<{ hospital: HospitalRecord }> => {
  const response = await fetch(`${API_URL}/hospitals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(hospitalData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create hospital");
  }

  return response.json();
};

export const getBHUs = async (): Promise<{
  bhus: BHURecord[];
}> => {
  const response = await fetch(`${API_URL}/bhus`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch BHUs");
  }

  return response.json();
};

export const createBHU = async (
  bhuData: BHUPayload,
): Promise<{ bhu: BHURecord }> => {
  const response = await fetch(`${API_URL}/bhus`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(bhuData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create BHU");
  }

  return response.json();
};

export const register = async (userData: {
  name: string;
  phone?: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
};
