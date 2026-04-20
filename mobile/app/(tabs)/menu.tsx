import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  Heart,
  FileText,
  Translate,
  Bell,
  ShieldCheck,
  Question,
  SignOut,
  CaretRight,
  FirstAidKit,
  UsersThree,
  Moon,
  Gear,
  ClockCounterClockwise,
  Wallet,
  ChatCircleDots,
  Siren,
  Info,
  Star,
} from 'phosphor-react-native';
import { Colors, Fonts } from '../../constants/theme';

const MENU_SECTIONS = [
  {
    title: 'Health',
    items: [
      { icon: Heart, label: 'My Health Summary', color: '#EF4444' },
      { icon: FileText, label: 'Lab Reports', color: '#10B981' },
      { icon: FirstAidKit, label: 'Insurance & Coverage', color: '#F97316' },
      { icon: ClockCounterClockwise, label: 'Visit History', color: Colors.primary },
    ],
  },
  {
    title: 'Family',
    items: [
      { icon: UsersThree, label: 'Family Members', color: '#8B5CF6' },
      { icon: Siren, label: 'Emergency Contacts', color: '#EF4444' },
    ],
  },
  {
    title: 'Payments',
    items: [
      { icon: Wallet, label: 'Payment Methods', color: '#10B981' },
      { icon: FileText, label: 'Billing & Invoices', color: '#6366F1' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: ChatCircleDots, label: 'Help & Support', color: Colors.primary },
      { icon: Question, label: 'FAQs', color: '#F59E0B' },
      { icon: Star, label: 'Rate the App', color: '#F59E0B' },
      { icon: Info, label: 'About AiMedicare', color: Colors.textMuted },
    ],
  },
];

export default function MenuScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu</Text>
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
            <Gear size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={styles.profileIconWrap}>
            <User size={22} color={Colors.primary} weight="fill" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Tshering Dorji</Text>
            <Text style={styles.profileSub}>View & edit your profile</Text>
          </View>
          <CaretRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.toggleRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.primary + '14' }]}>
                <Translate size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuLabel}>Language</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>English</Text>
              <CaretRight size={16} color={Colors.textMuted} />
            </View>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.primary + '14' }]}>
                <Bell size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuLabel}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
              thumbColor={notifications ? Colors.primary : '#CCC'}
            />
          </View>
          <View style={[styles.toggleRow, styles.noBorder]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#6366F1' + '14' }]}>
                <Moon size={18} color="#6366F1" />
              </View>
              <Text style={styles.menuLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.border, true: '#6366F1' + '40' }}
              thumbColor={darkMode ? '#6366F1' : '#CCC'}
            />
          </View>
        </View>

        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[
                  styles.menuRow,
                  ii === section.items.length - 1 && styles.noBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconWrap, { backgroundColor: item.color + '14' }]}>
                    <item.icon size={18} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <CaretRight size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#10B981' + '14' }]}>
                <ShieldCheck size={18} color="#10B981" />
              </View>
              <Text style={styles.menuLabel}>Privacy & Security</Text>
            </View>
            <CaretRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuRow, styles.noBorder]} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: Colors.textMuted + '14' }]}>
                <FileText size={18} color={Colors.textMuted} />
              </View>
              <Text style={styles.menuLabel}>Terms & Conditions</Text>
            </View>
            <CaretRight size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.7}
          onPress={async () => {
            await logout();
            router.replace('/screens/login');
          }}
        >
          <SignOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>AiMedicare v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FD' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textPrimary, letterSpacing: -0.5 },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  profileIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '14', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textPrimary },
  profileSub: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.textPrimary, letterSpacing: -0.2, marginBottom: 12 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border + '60' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border + '60' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textPrimary },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textMuted },
  noBorder: { borderBottomWidth: 0 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.error + '10', borderRadius: 14, paddingVertical: 14, marginTop: 4, marginBottom: 8, borderWidth: 1, borderColor: Colors.error + '20' },
  signOutText: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.error },
  versionText: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
});
