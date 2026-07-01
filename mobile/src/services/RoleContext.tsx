import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import type { Role } from '@/src/theme/theme';
import { getSelectedRole, setSelectedRole as saveRole, clearRole as removeRole } from './storage';

interface RoleContextType {
  role: Role | null;
  isLoading: boolean;
  setRole: (role: Role) => Promise<void>;
  clearRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  isLoading: true,
  setRole: async () => {},
  clearRole: async () => {},
});

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

interface RoleProviderProps {
  children: React.ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, []);

  async function loadRole() {
    try {
      const savedRole = await getSelectedRole();
      setRoleState(savedRole);
    } catch (error) {
      console.error('Failed to load role:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const setRole = useCallback(async (newRole: Role) => {
    await saveRole(newRole);
    setRoleState(newRole);
  }, []);

  const clearRoleHandler = useCallback(async () => {
    await removeRole();
    setRoleState(null);
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        isLoading,
        setRole,
        clearRole: clearRoleHandler,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}
