import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  User,
  PencilSimple,
  Heart,
  FileText,
  Translate,
  Bell,
  ShieldCheck,
  Question,
  SignOut,
  CaretRight,
  IdentificationCard,
  FirstAidKit,
  UsersThree,
  Gear,
  Moon,
  Phone,
  MapPin,
  Envelope,
  CalendarBlank,
  Warning,
  Star,
  Pill,
  Siren,
  Copy,
} from 'phosphor-react-native';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

// --- MOCK DATA ---
const PROFILE_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80';

const USER = {
  name: 'Tshering Dorji',
  cid: '10205001234',
  healthId: 'BT-AIM-20260418-0042',
  phone: '+975 17 12 3456',
  email: 'tshering.dorji@mail.bt',
  dob: '15 March 1990',
  bloodType: 'O+',
  location: 'Thimphu, Bhutan',
  allergies: ['Penicillin', 'Sulfa drugs'],
  emergencyContact: {
    name: 'Karma Choden',
    relation: 'Spouse',
    phone: '+975 17 65 4321',
  },
};

const FAMILY_MEMBERS = [
  { name: 'Karma Choden', relation: 'Spouse', avatar: null, initials: 'KC' },
  { name: 'Sonam Dorji', relation: 'Son', avatar: null, initials: 'SD' },
  { name: 'Pema Lhamo', relation: 'Mother', avatar: null, initials: 'PL' },
];

const HEALTH_STATS = [
  { label: 'Appointments', value: '24', icon: CalendarBlank, color: Colors.primary },
  { label: 'Prescriptions', value: '18', icon: Pill, color: '#F97316' },
  { label: 'Lab Reports', value: '12', icon: FileText, color: '#10B981' },
];

// --- SCREEN ---

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
            <Gear size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Profile Card ── */}
        <LinearGradient
          colors={[Colors.primary, '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileBlob1} />
          <View style={styles.profileBlob2} />

          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: PROFILE_AVATAR }} style={styles.avatar} />
              <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
                <PencilSimple size={12} color="#FFF" weight="bold" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{USER.name}</Text>
              <View style={styles.locationRow}>
                <MapPin size={13} color="rgba(255,255,255,0.7)" weight="fill" />
                <Text style={styles.profileLocation}>{USER.location}</Text>
              </View>
            </View>
          </View>

          {/* Health ID Badge */}
          <View style={styles.healthIdBadge}>
            <IdentificationCard size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.healthIdLabel}>Health ID</Text>
            <Text style={styles.healthIdValue}>{USER.healthId}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Copy size={14} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Health Stats Row ── */}
        <View style={styles.statsRow}>
          {HEALTH_STATS.map((stat, i) => (
            <TouchableOpacity key={i} style={styles.statCard} activeOpacity={0.8}>
              <View style={[styles.statIconWrap, { backgroundColor: stat.color + '14' }]}>
                <stat.icon size={20} color={stat.color} weight="fill" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Personal Information ── */}
        <View style={styles.sectionCard}>
          <SectionHeader title="Personal Information" />
          <InfoRow icon={User} label="Full Name" value={USER.name} />
          <InfoRow icon={IdentificationCard} label="CID Number" value={USER.cid} />
          <InfoRow icon={CalendarBlank} label="Date of Birth" value={USER.dob} />
          <InfoRow icon={Heart} label="Blood Type" value={USER.bloodType} />
          <InfoRow icon={Phone} label="Phone" value={USER.phone} />
          <InfoRow icon={Envelope} label="Email" value={USER.email} isLast />
        </View>

        {/* ── Allergies ── */}
        <View style={styles.sectionCard}>
          <SectionHeader title="Allergies & Alerts" />
          <View style={styles.allergyRow}>
            {USER.allergies.map((allergy, i) => (
              <View key={i} style={styles.allergyChip}>
                <Warning size={13} color={Colors.error} weight="fill" />
                <Text style={styles.allergyText}>{allergy}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addAllergyChip} activeOpacity={0.7}>
              <Text style={styles.addAllergyText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Family Members ── */}
        <View style={styles.sectionCard}>
          <SectionHeader title="Family Members" actionLabel="Manage" />
          {FAMILY_MEMBERS.map((member, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.familyRow, i === FAMILY_MEMBERS.length - 1 && styles.noBorder]}
              activeOpacity={0.7}
            >
              <View style={styles.familyAvatar}>
                <Text style={styles.familyInitials}>{member.initials}</Text>
              </View>
              <View style={styles.familyInfo}>
                <Text style={styles.familyName}>{member.name}</Text>
                <Text style={styles.familyRelation}>{member.relation}</Text>
              </View>
              <CaretRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Emergency Contact ── */}
        <View style={styles.sectionCard}>
          <SectionHeader title="Emergency Contact" />
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyIconWrap}>
              <Siren size={20} color="#FFF" weight="fill" />
            </View>
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyName}>{USER.emergencyContact.name}</Text>
              <Text style={styles.emergencyDetail}>
                {USER.emergencyContact.relation} · {USER.emergencyContact.phone}
              </Text>
            </View>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.7}>
              <Phone size={18} color={Colors.primary} weight="fill" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Preferences ── */}
        <View style={styles.sectionCard}>
          <SectionHeader title="Preferences" />
          <MenuItem icon={Translate} label="Language" value="English" />
          <View style={styles.menuToggleRow}>
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
          <View style={[styles.menuToggleRow, styles.noBorder]}>
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

        {/* ── Support ── */}
        <View style={styles.sectionCard}>
          <SectionHeader title="Support" />
          <MenuItem icon={ShieldCheck} label="Privacy & Security" color="#10B981" />
          <MenuItem icon={Question} label="Help & FAQ" color="#F59E0B" isLast />
        </View>

        {/* ── Sign Out ── */}
        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.7}>
          <SignOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>AiMedicare v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- COMPONENTS ---

function SectionHeader({ title, actionLabel }: { title: string; actionLabel?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  isLast,
}: {
  icon: any;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, isLast && styles.noBorder]}>
      <View style={styles.infoLeft}>
        <Icon size={16} color={Colors.textMuted} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MenuItem({
  icon: Icon,
  label,
  value,
  color,
  isLast,
}: {
  icon: any;
  label: string;
  value?: string;
  color?: string;
  isLast?: boolean;
}) {
  const iconColor = color || Colors.primary;
  return (
    <TouchableOpacity
      style={[styles.menuRow, isLast && styles.noBorder]}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconWrap, { backgroundColor: iconColor + '14' }]}>
          <Icon size={18} color={iconColor} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <CaretRight size={16} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FD' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 4 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Profile Card
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  profileBlob1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileBlob2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: '#FFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileLocation: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  healthIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  healthIdLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthIdValue: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#FFF',
    flex: 1,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Section Card
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionAction: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '60',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  infoValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  noBorder: { borderBottomWidth: 0 },

  // Allergies
  allergyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.error + '10',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  allergyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.error,
  },
  addAllergyChip: {
    backgroundColor: Colors.primary + '10',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  addAllergyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
  },

  // Family Members
  familyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '60',
  },
  familyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  familyInitials: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },
  familyInfo: { flex: 1 },
  familyName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  familyRelation: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // Emergency Contact
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '08',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.error + '15',
  },
  emergencyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyInfo: { flex: 1 },
  emergencyName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  emergencyDetail: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '14',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Menu Items
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '60',
  },
  menuToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '60',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },

  // Sign Out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error + '10',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  signOutText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.error,
  },

  // Version
  versionText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
