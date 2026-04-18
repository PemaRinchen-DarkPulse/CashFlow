import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MapPin,
  CaretDown,
  Bell,
  Phone,
  User,
  CalendarBlank,
  Clock,
  Stethoscope,
  Heartbeat,
  Bone,
  Brain,
  FirstAid,
  Baby,
  Leaf,
  Faders,
  Star,
  Pill,
  Warning,
  Calendar,
  CaretRight,
  VideoCamera,
  SirenIcon,
  ArrowRight,
} from 'phosphor-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

// --- MOCK DATA (replace with API) ---

const SPECIALITIES = [
  { icon: Stethoscope, label: 'General', gradient: ['#E8EEFB', '#D4DFFA'] as const },
  { icon: Heartbeat, label: 'Cardiology', gradient: ['#FDE8E8', '#FACFCF'] as const },
  { icon: Bone, label: 'Orthopedic', gradient: ['#E8EEFB', '#D4DFFA'] as const },
  { icon: Brain, label: 'Neurology', gradient: ['#E8F5E8', '#D0EBD0'] as const },
  { icon: Baby, label: 'Maternal', gradient: ['#FEF3E2', '#FDE5C3'] as const },
  { icon: FirstAid, label: 'Emergency', gradient: ['#FDE8E8', '#FACFCF'] as const },
  { icon: Leaf, label: 'Sowa Rigpa', gradient: ['#E8F5E8', '#D0EBD0'] as const },
  { icon: Faders, label: 'NCD Care', gradient: ['#F3E8FB', '#E4D0F7'] as const },
];

const DOCTOR_AVATAR = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80';
const PROFILE_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80';

const ALERTS = [
  {
    id: '1',
    title: 'Medication Reminder',
    subtitle: 'Amlodipine 5mg due at 2:00 PM',
    color: '#EF4444',
    icon: Pill,
  },
  {
    id: '2',
    title: 'Blood Pressure Alert',
    subtitle: 'Reading 150/95 — consult your provider',
    color: '#F59E0B',
    icon: Warning,
  },
  {
    id: '3',
    title: 'Upcoming Appointment',
    subtitle: 'Dr. Tshering Dorji — Tomorrow, 9 AM',
    color: Colors.primary,
    icon: Calendar,
  },
];

const FACILITIES = [
  {
    name: 'JDWNRH',
    subtitle: 'Referral Hospital · Thimphu',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80',
  },
  {
    name: 'Paro Hospital',
    subtitle: 'District Hospital · Paro',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
  },
];

const MEDICATIONS = [
  { id: '1', name: 'Amlodipine', dosage: '5mg', time: '8:00 AM', taken: true },
  { id: '2', name: 'Metformin', dosage: '500mg', time: '1:00 PM', taken: false },
];

// --- SCREEN ---

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/profile')}>
              <Image source={{ uri: PROFILE_AVATAR }} style={styles.avatar} />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <TouchableOpacity style={styles.locationRow}>
                <MapPin size={14} color={Colors.primary} weight="fill" />
                <Text style={styles.locationText}>Thimphu, Bhutan</Text>
                <CaretDown size={12} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Bell size={22} color={Colors.textPrimary} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* ── AI Vitals Card ── */}
        <LinearGradient
          colors={[Colors.primary, '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vitalsCard}
        >
          {/* Decorative blobs */}
          <View style={styles.vitalsBlob1} />
          <View style={styles.vitalsBlob2} />

          {/* Top row: badge + score ring */}
          <View style={styles.vitalsTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.aiBadge}>
                <View style={styles.aiBadgeDot} />
                <Text style={styles.aiBadgeText}>AI ANALYSIS ACTIVE</Text>
              </View>
              <Text style={styles.vitalsHeadline}>Your vitals are{"\n"}looking great.</Text>
            </View>

            {/* Circular score */}
            <View style={styles.scoreWrap}>
              <Svg width={56} height={56}>
                <Circle
                  cx={28}
                  cy={28}
                  r={23}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={4.5}
                  fill="none"
                />
                <Circle
                  cx={28}
                  cy={28}
                  r={23}
                  stroke="#34D399"
                  strokeWidth={4.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 23}`}
                  strokeDashoffset={`${2 * Math.PI * 23 * (1 - 0.92)}`}
                  transform="rotate(-90 28 28)"
                />
              </Svg>
              <Text style={styles.scoreText}>92</Text>
            </View>
          </View>

          {/* Bottom stats row */}
          <View style={styles.vitalsStats}>
            <View style={styles.vitalsStat}>
              <Text style={styles.vitalsStatLabel}>Heart</Text>
              <Text style={styles.vitalsStatValue}>72 <Text style={styles.vitalsStatUnit}>bpm</Text></Text>
            </View>
            <View style={styles.vitalsStat}>
              <Text style={styles.vitalsStatLabel}>Sleep</Text>
              <Text style={styles.vitalsStatValue}>7<Text style={styles.vitalsStatUnit}>h </Text>20<Text style={styles.vitalsStatUnit}>m</Text></Text>
            </View>
            <View style={styles.vitalsStat}>
              <Text style={styles.vitalsStatLabel}>Active</Text>
              <Text style={styles.vitalsStatValue}>1.2 <Text style={styles.vitalsStatUnit}>kcal</Text></Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Upcoming Consultation ── */}
        <SectionHeader title="Upcoming" count={3} />
        <View style={styles.consultCard}>
          {/* Top row: avatar + name + badge */}
          <View style={styles.consultTop}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>KW</Text>
            </View>
            <View style={styles.consultInfo}>
              <View style={styles.consultNameRow}>
                <Text style={styles.consultName}>Dr. Karma Wangdi</Text>
                <View style={styles.scheduledBadge}>
                  <Text style={styles.scheduledBadgeText}>Scheduled</Text>
                </View>
              </View>
              <Text style={styles.consultSpec}>General Physician</Text>
            </View>
          </View>

          {/* Meta row */}
          <View style={styles.consultMetaRow}>
            <View style={styles.consultMeta}>
              <CalendarBlank size={14} color={Colors.textMuted} />
              <Text style={styles.consultMetaText}>Today</Text>
            </View>
            <View style={styles.consultMeta}>
              <User size={14} color={Colors.textMuted} />
              <Text style={styles.consultMetaText}>2:30 PM</Text>
            </View>
            <View style={styles.consultMeta}>
              <Phone size={14} color={Colors.textMuted} />
              <Text style={styles.consultMetaText}>Video Call</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.consultActions}>
            <TouchableOpacity style={styles.rescheduleBtn} activeOpacity={0.7}>
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.joinCallBtn} activeOpacity={0.8}>
              <Text style={styles.joinCallBtnText}>Join Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Medications Today ── */}
        <SectionHeader title="Medications Today" />
        <View style={styles.medsContainer}>
          {MEDICATIONS.map((med) => (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDetail}>{med.dosage} · {med.time}</Text>
              </View>
              {med.taken ? (
                <View style={styles.takenBadge}>
                  <Text style={styles.takenBadgeText}>Taken</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.takeBadge} activeOpacity={0.7}>
                  <Text style={styles.takeBadgeText}>Take</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <CalendarBlank size={24} color="#F97316" weight="fill" />
            <Text style={styles.actionLabel}>Book</Text>
            <Text style={styles.actionDesc}>Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <Phone size={24} color="#16A34A" weight="fill" />
            <Text style={styles.actionLabel}>Consult</Text>
            <Text style={styles.actionDesc}>Video/Audio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <Warning size={24} color="#DC2626" weight="fill" />
            <Text style={styles.actionLabel}>SOS</Text>
            <Text style={styles.actionDesc}>Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* ── Nearby Facilities ── */}
        <SectionHeader title="Nearby Facilities" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.facilityScroll}
        >
          {FACILITIES.map((f, i) => (
            <TouchableOpacity key={i} style={styles.facilityCard} activeOpacity={0.85}>
              <Image source={{ uri: f.image }} style={styles.facilityImg} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.55)']}
                style={styles.facilityOverlay}
              >
                <View style={styles.ratingChip}>
                  <Star size={10} color="#FFF" weight="fill" />
                  <Text style={styles.ratingText}>{f.rating}</Text>
                </View>
              </LinearGradient>
              <View style={styles.facilityInfo}>
                <Text style={styles.facilityName}>{f.name}</Text>
                <Text style={styles.facilitySub}>{f.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- COMPONENTS ---

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- STYLES ---

const SHADOW = {} as object;
const SHADOW_SM = {} as object;

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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  greeting: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  locationText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
  },
  bellBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW_SM,
  },
  bellDot: {
    position: 'absolute',
    top: 12,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  // AI Vitals Card
  vitalsCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  vitalsBlob1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  vitalsBlob2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  vitalsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  aiBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  aiBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  vitalsHeadline: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFF',
    lineHeight: 23,
    letterSpacing: -0.3,
  },
  scoreWrap: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    position: 'absolute',
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFF',
  },
  vitalsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  vitalsStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  vitalsStatLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  vitalsStatValue: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#FFF',
  },
  vitalsStatUnit: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 14,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontFamily: Fonts.bold, fontSize: 10, color: '#FFF' },
  seeAll: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.primary },

  // Consultation Card
  consultCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW_SM,
  },
  consultTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#4A7C59',
  },
  consultInfo: { flex: 1 },
  consultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  consultName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  scheduledBadge: {
    backgroundColor: '#FEF3E2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  scheduledBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: '#D97706',
  },
  consultSpec: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  consultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  consultMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  consultMetaText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  consultActions: {
    flexDirection: 'row',
    gap: 10,
  },
  rescheduleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rescheduleBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  joinCallBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinCallBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#FFF',
  },

  // Medications Today
  medsContainer: {
    gap: 10,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW_SM,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  medDetail: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  takenBadge: {
    backgroundColor: '#E8F5E8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  takenBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#16A34A',
  },
  takeBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  takeBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#FFF',
  },

  // Specialities
  specList: { gap: 14, paddingRight: 24 },
  specItem: { alignItems: 'center', width: 72 },
  specIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    ...SHADOW_SM,
  },
  specLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // Facilities
  facilityScroll: { gap: 12, paddingRight: 24 },
  facilityCard: {
    width: CARD_WIDTH,
    borderRadius: 18,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW,
  },
  facilityImg: { width: '100%', height: 110, resizeMode: 'cover' },
  facilityOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 10,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backdropFilter: 'blur(4px)',
  },
  ratingText: { fontFamily: Fonts.bold, fontSize: 10, color: '#FFF' },
  facilityInfo: { padding: 12 },
  facilityName: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  facilitySub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Quick Actions
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionCard: {
    width: (Dimensions.get('window').width - 48 - 20) / 3,
    height: (Dimensions.get('window').width - 48 - 20) / 3,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
  actionDesc: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },
});
