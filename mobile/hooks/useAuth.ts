import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const savedUser = await SecureStore.getItemAsync(USER_KEY);
      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
      setIsLoading(false);
    })();
  }, []);

  const saveAuth = useCallback(async (newToken: string, newUser: Record<string, unknown>) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    saveAuth,
    logout,
  };
}
