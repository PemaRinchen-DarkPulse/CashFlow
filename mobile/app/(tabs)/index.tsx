import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MagnifyingGlass,
  MapPin,
  CaretDown,
  Bell,
  Phone,
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

// --- SCREEN ---

export default function HomeScreen() {
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
            <Image source={{ uri: PROFILE_AVATAR }} style={styles.avatar} />
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

        {/* ── Search ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MagnifyingGlass size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, hospitals..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Faders size={18} color={Colors.white} weight="bold" />
          </TouchableOpacity>
        </View>

        {/* ── Priority Alert Banner ── */}
        {ALERTS.length > 0 && (
          <TouchableOpacity activeOpacity={0.85}>
            <LinearGradient
              colors={['#1A1A2E', '#2D2B55']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.alertBanner}
            >
              <View style={styles.alertBannerLeft}>
                <View style={styles.alertPulse}>
                  <View style={styles.alertPulseInner} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertBannerTitle}>
                    {ALERTS.length} action{ALERTS.length > 1 ? 's' : ''} needed
                  </Text>
                  <Text style={styles.alertBannerSub}>
                    {ALERTS[0].subtitle}
                  </Text>
                </View>
              </View>
              <CaretRight size={18} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Alert Pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alertPills}
        >
          {ALERTS.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[styles.alertPill, { borderColor: a.color + '30' }]}
              activeOpacity={0.7}
            >
              <a.icon size={14} color={a.color} weight="fill" />
              <Text style={[styles.alertPillText, { color: a.color }]}>
                {a.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Upcoming Consultation ── */}
        <SectionHeader title="Upcoming" count={3} />
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={[Colors.primary, '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.consultCard}
          >
            {/* Decorative circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.consultTop}>
              <Image source={{ uri: DOCTOR_AVATAR }} style={styles.doctorImg} />
              <View style={styles.consultInfo}>
                <Text style={styles.consultName}>Dr. Tshering Dorji</Text>
                <Text style={styles.consultSpec}>General Physician</Text>
              </View>
              <TouchableOpacity style={styles.phoneBtn}>
                <Phone size={18} color={Colors.primary} weight="fill" />
              </TouchableOpacity>
            </View>

            <View style={styles.consultDivider} />

            <View style={styles.consultBottom}>
              <View style={styles.consultMeta}>
                <CalendarBlank size={14} color="rgba(255,255,255,0.75)" />
                <Text style={styles.consultMetaText}>Mon, 20 Apr</Text>
              </View>
              <View style={styles.consultMetaDot} />
              <View style={styles.consultMeta}>
                <Clock size={14} color="rgba(255,255,255,0.75)" />
                <Text style={styles.consultMetaText}>09:00 – 10:00</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Specialities ── */}
        <SectionHeader title="Specialities" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specList}
        >
          {SPECIALITIES.map((s, i) => (
            <TouchableOpacity key={i} style={styles.specItem} activeOpacity={0.75}>
              <LinearGradient colors={s.gradient} style={styles.specIcon}>
                <s.icon size={24} color={Colors.primary} weight="duotone" />
              </LinearGradient>
              <Text style={styles.specLabel} numberOfLines={1}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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

        {/* ── Quick Actions ── */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <LinearGradient
              colors={[Colors.primary, '#2563EB']}
              style={styles.actionIconWrap}
            >
              <VideoCamera size={22} color="#FFF" weight="fill" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Teleconsult</Text>
            <Text style={styles.actionDesc}>Talk to a specialist</Text>
            <View style={styles.actionArrow}>
              <ArrowRight size={14} color={Colors.primary} weight="bold" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.actionIconWrap}
            >
              <FirstAid size={22} color="#FFF" weight="fill" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Emergency</Text>
            <Text style={styles.actionDesc}>SOS one-tap alert</Text>
            <View style={[styles.actionArrow, { backgroundColor: '#FEF2F2' }]}>
              <ArrowRight size={14} color="#EF4444" weight="bold" />
            </View>
          </TouchableOpacity>
        </View>

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

  // Search
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW_SM,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },

  // Alert Banner
  alertBanner: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  alertPulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertPulseInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
  },
  alertBannerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: '#FFF',
    letterSpacing: -0.2,
  },
  alertBannerSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },

  // Alert Pills
  alertPills: { gap: 8, marginBottom: 8, paddingRight: 24 },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
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
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    ...SHADOW,
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  consultTop: { flexDirection: 'row', alignItems: 'center' },
  doctorImg: {
    width: 50,
    height: 50,
    borderRadius: 16,
    marginRight: 14,
  },
  consultInfo: { flex: 1 },
  consultName: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#FFF',
    letterSpacing: -0.2,
  },
  consultSpec: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  phoneBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  consultDivider: {
    height: 0,
    marginVertical: 10,
  },
  consultBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consultMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  consultMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 10,
  },
  consultMetaText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
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
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...SHADOW,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionLabel: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  actionDesc: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  actionArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});
