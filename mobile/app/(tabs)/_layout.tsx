import { Tabs } from 'expo-router';
import { House, Folder, CalendarCheck, Pill, List, Buildings, UsersThree, Gear, UserList, ListNumbers, FirstAidKit } from 'phosphor-react-native';
import { Colors, Fonts } from '../../constants/theme';
import { Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function TabLayout() {
  const { user } = useAuth();
  const role = (user as any)?.role;
  const isSuperAdmin = role === 'super_admin';
  const isReceptionist = role === 'receptionist';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: Fonts.semiBold,
          fontSize: 11,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          borderLeftWidth: 1,
          borderLeftColor: Colors.border,
          borderRightWidth: 1,
          borderRightColor: Colors.border,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          position: 'absolute',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      {/* Home — visible to all */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <House size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      {/* Patients — receptionist only (2nd tab for receptionist) */}
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          href: isReceptionist ? '/(tabs)/patients' : null,
          tabBarIcon: ({ color, focused }) => (
            <UserList size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      {/* Records — hidden for super_admin and receptionist */}
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          href: isSuperAdmin || isReceptionist ? null : '/(tabs)/records',
          tabBarIcon: ({ color, focused }) => (
            <Folder size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      {/* Appointments — visible for regular users and receptionist */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointment',
          href: isSuperAdmin ? null : '/(tabs)/appointments',
          tabBarIcon: ({ color, focused }) => (
            <CalendarCheck size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      {/* Queue — receptionist only (4th tab for receptionist) */}
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Queue',
          href: isReceptionist ? '/(tabs)/queue' : null,
          tabBarIcon: ({ color, focused }) => (
            <ListNumbers size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      {/* Pharmacy — hidden for super_admin and receptionist */}
      <Tabs.Screen
        name="pharmacy"
        options={{
          title: 'Pharmacy',
          href: isSuperAdmin || isReceptionist ? null : '/(tabs)/pharmacy',
          tabBarIcon: ({ color, focused }) => (
            <Pill size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      {/* Menu — visible for regular users and receptionist */}
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <List size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      {/* Super admin tabs — hidden for regular users */}
      <Tabs.Screen
        name="add-hospital"
        options={{
          title: 'Add Hospital',
          href: isSuperAdmin ? '/(tabs)/add-hospital' : null,
          tabBarIcon: ({ color, focused }) => (
            <Buildings size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-bhu"
        options={{
          title: 'Add BHU',
          href: isSuperAdmin ? ('/(tabs)/add-bhu' as never) : null,
          tabBarIcon: ({ color, focused }) => (
            <FirstAidKit size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage-users"
        options={{
          title: 'Users',
          href: isSuperAdmin ? '/(tabs)/manage-users' : null,
          tabBarIcon: ({ color, focused }) => (
            <UsersThree size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage-pharmacy"
        options={{
          title: 'Pharmacy',
          href: isSuperAdmin ? '/(tabs)/manage-pharmacy' : null,
          tabBarIcon: ({ color, focused }) => (
            <Pill size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          href: isSuperAdmin ? '/(tabs)/settings' : null,
          tabBarIcon: ({ color, focused }) => (
            <Gear size={24} color={color} weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
