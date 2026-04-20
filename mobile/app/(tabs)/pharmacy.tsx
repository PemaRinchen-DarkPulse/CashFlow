import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Pill,
  Clock,
  MapPin,
  CaretRight,
  X,
  Warning,
  CheckCircle,
  ArrowClockwise,
  ShieldWarning,
  Info,
  Phone,
  NavigationArrow,
  Star,
  Package,
} from 'phosphor-react-native';
import { Colors, Fonts } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── TABS ──
type PharmacyTab = 'prescriptions' | 'refills' | 'nearby';

// ── MOCK DATA ──

const PRESCRIPTIONS = [
  {
    id: '1',
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily — Morning',
    prescribedBy: 'Dr. Karma Wangdi',
    startDate: 'Jan 15, 2025',
    status: 'active' as const,
    refillsLeft: 3,
    nextRefill: 'May 1, 2026',
    instructions: 'Take one tablet by mouth every morning with or without food. Swallow whole, do not crush or chew. Take at the same time each day for best results.',
    sideEffects: 'Dizziness, swelling of ankles/feet, flushing. Contact your doctor if you experience severe dizziness or irregular heartbeat.',
    interactions: [
      { drug: 'Simvastatin', severity: 'moderate' as const, note: 'May increase risk of muscle pain when taken together. Monitor for unexplained muscle weakness.' },
      { drug: 'Grapefruit Juice', severity: 'mild' as const, note: 'May increase drug levels. Avoid consuming large quantities of grapefruit.' },
    ],
    forCondition: 'Essential Hypertension (I10)',
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily — Morning & Evening',
    prescribedBy: 'Dr. Dechen Zangmo',
    startDate: 'Aug 10, 2024',
    status: 'active' as const,
    refillsLeft: 2,
    nextRefill: 'Apr 28, 2026',
    instructions: 'Take one tablet with breakfast and one with dinner. Take with food to reduce stomach upset. Do not skip doses. Drink plenty of water throughout the day.',
    sideEffects: 'Nausea, diarrhea, stomach discomfort (usually improves over time). Rare: lactic acidosis — seek immediate help if you feel very weak or have trouble breathing.',
    interactions: [
      { drug: 'Alcohol', severity: 'severe' as const, note: 'Increases risk of lactic acidosis. Avoid excessive alcohol consumption while taking Metformin.' },
      { drug: 'Contrast Dye', severity: 'severe' as const, note: 'Must be stopped 48 hours before and after procedures involving iodinated contrast. Inform your radiologist.' },
    ],
    forCondition: 'Type 2 Diabetes (E11)',
  },
  {
    id: '3',
    name: 'Cetirizine',
    dosage: '10mg',
    frequency: 'Once daily — As needed',
    prescribedBy: 'Dr. Thinley Norbu',
    startDate: 'Mar 20, 2026',
    status: 'completed' as const,
    refillsLeft: 0,
    nextRefill: null,
    instructions: 'Take one tablet as needed for allergy symptoms. Can be taken with or without food. Do not exceed one tablet per day.',
    sideEffects: 'Drowsiness, dry mouth, fatigue. Avoid driving until you know how this medication affects you.',
    interactions: [
      { drug: 'Alcohol', severity: 'moderate' as const, note: 'May increase drowsiness. Avoid alcohol while taking this medication.' },
    ],
    forCondition: 'Allergic Rhinitis (J30.2)',
  },
  {
    id: '4',
    name: 'Omeprazole',
    dosage: '20mg',
    frequency: 'Once daily — Before breakfast',
    prescribedBy: 'Dr. Karma Wangdi',
    startDate: 'Mar 1, 2026',
    status: 'active' as const,
    refillsLeft: 5,
    nextRefill: 'May 15, 2026',
    instructions: 'Take one capsule 30 minutes before breakfast on an empty stomach. Swallow whole — do not crush or chew. Complete the full course as prescribed.',
    sideEffects: 'Headache, stomach pain, nausea. Long-term use may affect calcium/magnesium absorption.',
    interactions: [
      { drug: 'Clopidogrel', severity: 'severe' as const, note: 'Reduces the effectiveness of Clopidogrel significantly. Use alternative acid reducer if on blood thinners.' },
      { drug: 'Metformin', severity: 'mild' as const, note: 'May slightly increase Metformin absorption. Generally safe — no dose adjustment needed.' },
    ],
    forCondition: 'Gastric Acid Reflux',
  },
];

const REFILL_ALERTS = [
  {
    id: '1',
    medication: 'Metformin 500mg',
    dueDate: 'Apr 28, 2026',
    daysLeft: 8,
    urgency: 'soon' as const,
    pharmacy: 'JDWNRH Pharmacy',
  },
  {
    id: '2',
    medication: 'Amlodipine 5mg',
    dueDate: 'May 1, 2026',
    daysLeft: 11,
    urgency: 'upcoming' as const,
    pharmacy: 'JDWNRH Pharmacy',
  },
  {
    id: '3',
    medication: 'Omeprazole 20mg',
    dueDate: 'May 15, 2026',
    daysLeft: 25,
    urgency: 'upcoming' as const,
    pharmacy: 'Thimphu City Pharmacy',
  },
];

const NEARBY_PHARMACIES = [
  {
    id: '1',
    name: 'JDWNRH Pharmacy',
    address: 'JDWNRH Campus, Thimphu',
    distance: '1.2 km',
    hours: '8:00 AM – 6:00 PM',
    isOpen: true,
    phone: '+975-2-322497',
    rating: 4.8,
    stockStatus: 'All your medications in stock',
  },
  {
    id: '2',
    name: 'Thimphu City Pharmacy',
    address: 'Norzin Lam, Thimphu',
    distance: '2.5 km',
    hours: '9:00 AM – 8:00 PM',
    isOpen: true,
    phone: '+975-2-334521',
    rating: 4.6,
    stockStatus: 'Metformin — limited stock',
  },
  {
    id: '3',
    name: 'Pema Pharmacy',
    address: 'Chang Lam, Thimphu',
    distance: '3.1 km',
    hours: '8:30 AM – 7:00 PM',
    isOpen: true,
    phone: '+975-2-328910',
    rating: 4.4,
    stockStatus: 'All your medications in stock',
  },
  {
    id: '4',
    name: 'Druk Medical Store',
    address: 'Babesa, Thimphu',
    distance: '5.8 km',
    hours: '9:00 AM – 5:00 PM',
    isOpen: false,
    phone: '+975-2-351234',
    rating: 4.2,
    stockStatus: 'Omeprazole — out of stock',
  },
];

// ── SCREEN ──

export default function PharmacyScreen() {
  const [activeTab, setActiveTab] = useState<PharmacyTab>('prescriptions');
  const [selectedPrescription, setSelectedPrescription] = useState<(typeof PRESCRIPTIONS)[0] | null>(null);

  const activeMeds = PRESCRIPTIONS.filter((p) => p.status === 'active');
  const completedMeds = PRESCRIPTIONS.filter((p) => p.status === 'completed');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Pharmacy</Text>
            <Text style={styles.headerSubtitle}>Manage your medications</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {([
            { key: 'prescriptions' as PharmacyTab, label: 'Prescriptions', icon: Pill },
            { key: 'refills' as PharmacyTab, label: 'Refills', icon: ArrowClockwise },
            { key: 'nearby' as PharmacyTab, label: 'Nearby', icon: MapPin },
          ]).map((tab) => {
            const active = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, active && styles.tabChipActive]}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab.key)}
              >
                <Icon size={16} color={active ? '#FFF' : Colors.textMuted} weight={active ? 'fill' : 'regular'} />
                <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{tab.label}</Text>
                {tab.key === 'refills' && REFILL_ALERTS.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{REFILL_ALERTS.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {activeTab === 'prescriptions' && (
          <>
            {/* Active Prescriptions */}
            <Text style={styles.sectionLabel}>Active ({activeMeds.length})</Text>
            {activeMeds.map((rx) => (
              <TouchableOpacity
                key={rx.id}
                style={styles.rxCard}
                activeOpacity={0.7}
                onPress={() => setSelectedPrescription(rx)}
              >
                <View style={styles.rxTop}>
                  <View style={[styles.rxIcon, styles.rxIconActive]}>
                    <Pill size={18} color={Colors.primary} weight="fill" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.rxNameRow}>
                      <Text style={styles.rxName}>{rx.name}</Text>
                      <Text style={styles.rxDosage}>{rx.dosage}</Text>
                    </View>
                    <Text style={styles.rxFreq}>{rx.frequency}</Text>
                  </View>
                  <CaretRight size={16} color={Colors.textMuted} />
                </View>
                <View style={styles.rxBottom}>
                  <View style={styles.rxMeta}>
                    <Clock size={12} color={Colors.textMuted} />
                    <Text style={styles.rxMetaText}>Refill: {rx.nextRefill}</Text>
                  </View>
                  <View style={styles.rxMeta}>
                    <Package size={12} color={Colors.textMuted} />
                    <Text style={styles.rxMetaText}>{rx.refillsLeft} refills left</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Completed */}
            {completedMeds.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Completed ({completedMeds.length})</Text>
                {completedMeds.map((rx) => (
                  <TouchableOpacity
                    key={rx.id}
                    style={[styles.rxCard, styles.rxCardCompleted]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedPrescription(rx)}
                  >
                    <View style={styles.rxTop}>
                      <View style={[styles.rxIcon, styles.rxIconCompleted]}>
                        <CheckCircle size={18} color={Colors.success} weight="fill" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.rxNameRow}>
                          <Text style={[styles.rxName, { color: Colors.textSecondary }]}>{rx.name}</Text>
                          <Text style={styles.rxDosage}>{rx.dosage}</Text>
                        </View>
                        <Text style={styles.rxFreq}>{rx.frequency}</Text>
                      </View>
                      <CaretRight size={16} color={Colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        {activeTab === 'refills' && (
          <>
            {/* Refill summary */}
            <LinearGradient
              colors={[Colors.warning, '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.refillBanner}
            >
              <ArrowClockwise size={24} color="#FFF" weight="bold" />
              <View style={{ flex: 1 }}>
                <Text style={styles.refillBannerTitle}>{REFILL_ALERTS.length} Upcoming Refills</Text>
                <Text style={styles.refillBannerSub}>Stay on top of your medication supply</Text>
              </View>
            </LinearGradient>

            {REFILL_ALERTS.map((alert) => (
              <View key={alert.id} style={styles.refillCard}>
                <View style={styles.refillTop}>
                  <View style={[styles.refillUrgency, alert.urgency === 'soon' ? styles.urgencySoon : styles.urgencyUpcoming]}>
                    <Clock size={16} color={alert.urgency === 'soon' ? Colors.error : Colors.warning} weight="fill" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.refillMedName}>{alert.medication}</Text>
                    <Text style={styles.refillPharmacy}>{alert.pharmacy}</Text>
                  </View>
                  <View style={[styles.daysLeftBadge, alert.urgency === 'soon' ? styles.daysLeftSoon : styles.daysLeftUpcoming]}>
                    <Text style={[styles.daysLeftText, alert.urgency === 'soon' ? { color: Colors.error } : { color: Colors.warning }]}>
                      {alert.daysLeft}d left
                    </Text>
                  </View>
                </View>
                <View style={styles.refillBottom}>
                  <Text style={styles.refillDueText}>Due: {alert.dueDate}</Text>
                  <TouchableOpacity style={styles.refillRequestBtn} activeOpacity={0.7}>
                    <Text style={styles.refillRequestText}>Request Refill</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'nearby' && (
          <>
            {NEARBY_PHARMACIES.map((pharmacy) => (
              <View key={pharmacy.id} style={styles.pharmacyCard}>
                <View style={styles.pharmacyTop}>
                  <View style={styles.pharmacyIconWrap}>
                    <MapPin size={20} color={Colors.primary} weight="fill" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.pharmacyNameRow}>
                      <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                      <View style={[styles.openBadge, pharmacy.isOpen ? styles.openBadgeOpen : styles.openBadgeClosed]}>
                        <Text style={[styles.openBadgeText, pharmacy.isOpen ? { color: Colors.success } : { color: Colors.error }]}>
                          {pharmacy.isOpen ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
                  </View>
                </View>

                <View style={styles.pharmacyMeta}>
                  <View style={styles.pharmacyMetaItem}>
                    <NavigationArrow size={12} color={Colors.textMuted} />
                    <Text style={styles.pharmacyMetaText}>{pharmacy.distance}</Text>
                  </View>
                  <View style={styles.pharmacyMetaItem}>
                    <Clock size={12} color={Colors.textMuted} />
                    <Text style={styles.pharmacyMetaText}>{pharmacy.hours}</Text>
                  </View>
                  <View style={styles.pharmacyMetaItem}>
                    <Star size={12} color={Colors.warning} weight="fill" />
                    <Text style={styles.pharmacyMetaText}>{pharmacy.rating}</Text>
                  </View>
                </View>

                <View style={styles.stockRow}>
                  <Package size={13} color={pharmacy.stockStatus.includes('out of stock') ? Colors.error : pharmacy.stockStatus.includes('limited') ? Colors.warning : Colors.success} />
                  <Text style={[
                    styles.stockText,
                    pharmacy.stockStatus.includes('out of stock') && { color: Colors.error },
                    pharmacy.stockStatus.includes('limited') && { color: Colors.warning },
                  ]}>
                    {pharmacy.stockStatus}
                  </Text>
                </View>

                <View style={styles.pharmacyActions}>
                  <TouchableOpacity style={styles.pharmacyCallBtn} activeOpacity={0.7}>
                    <Phone size={14} color={Colors.primary} />
                    <Text style={styles.pharmacyCallText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pharmacyDirectBtn} activeOpacity={0.7}>
                    <NavigationArrow size={14} color="#FFF" />
                    <Text style={styles.pharmacyDirectText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
      </ScrollView>

      {/* Prescription Detail Modal */}
      <PrescriptionDetailModal
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </SafeAreaView>
  );
}

// ── PRESCRIPTION DETAIL MODAL ──

function PrescriptionDetailModal({
  prescription,
  onClose,
}: {
  prescription: (typeof PRESCRIPTIONS)[0] | null;
  onClose: () => void;
}) {
  if (!prescription) return null;

  const severityColor = (s: string) =>
    s === 'severe' ? Colors.error : s === 'moderate' ? Colors.warning : Colors.textMuted;

  const severityLabel = (s: string) =>
    s === 'severe' ? 'High Risk' : s === 'moderate' ? 'Moderate' : 'Low';

  return (
    <Modal visible={!!prescription} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          {/* Header */}
          <View style={modalStyles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={modalStyles.sheetTitle}>{prescription.name}</Text>
                <View style={[modalStyles.statusPill, prescription.status === 'active' ? modalStyles.statusPillActive : modalStyles.statusPillCompleted]}>
                  <Text style={[modalStyles.statusPillText, prescription.status === 'active' ? { color: Colors.primary } : { color: Colors.success }]}>
                    {prescription.status === 'active' ? 'Active' : 'Completed'}
                  </Text>
                </View>
              </View>
              <Text style={modalStyles.sheetSub}>{prescription.dosage} · {prescription.frequency}</Text>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Prescribed Info */}
            <View style={modalStyles.infoRow}>
              <View style={modalStyles.infoItem}>
                <Text style={modalStyles.infoLabel}>Prescribed by</Text>
                <Text style={modalStyles.infoValue}>{prescription.prescribedBy}</Text>
              </View>
              <View style={modalStyles.infoItem}>
                <Text style={modalStyles.infoLabel}>For condition</Text>
                <Text style={modalStyles.infoValue}>{prescription.forCondition}</Text>
              </View>
            </View>
            <View style={modalStyles.infoRow}>
              <View style={modalStyles.infoItem}>
                <Text style={modalStyles.infoLabel}>Start date</Text>
                <Text style={modalStyles.infoValue}>{prescription.startDate}</Text>
              </View>
              <View style={modalStyles.infoItem}>
                <Text style={modalStyles.infoLabel}>Refills remaining</Text>
                <Text style={modalStyles.infoValue}>{prescription.refillsLeft}</Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={modalStyles.section}>
              <View style={modalStyles.sectionHeader}>
                <Info size={16} color={Colors.primary} weight="fill" />
                <Text style={modalStyles.sectionTitle}>Instructions</Text>
              </View>
              <View style={modalStyles.instructionBox}>
                <Text style={modalStyles.instructionText}>{prescription.instructions}</Text>
              </View>
            </View>

            {/* Side Effects */}
            <View style={modalStyles.section}>
              <View style={modalStyles.sectionHeader}>
                <Warning size={16} color={Colors.warning} weight="fill" />
                <Text style={modalStyles.sectionTitle}>Side Effects</Text>
              </View>
              <Text style={modalStyles.sideEffectsText}>{prescription.sideEffects}</Text>
            </View>

            {/* Interaction Warnings */}
            <View style={modalStyles.section}>
              <View style={modalStyles.sectionHeader}>
                <ShieldWarning size={16} color={Colors.error} weight="fill" />
                <Text style={modalStyles.sectionTitle}>Interaction Warnings</Text>
              </View>
              {prescription.interactions.map((interaction, i) => (
                <View key={i} style={[modalStyles.interactionCard, { borderLeftColor: severityColor(interaction.severity) }]}>
                  <View style={modalStyles.interactionTop}>
                    <Text style={modalStyles.interactionDrug}>{interaction.drug}</Text>
                    <View style={[modalStyles.severityBadge, { backgroundColor: severityColor(interaction.severity) + '18' }]}>
                      <Text style={[modalStyles.severityText, { color: severityColor(interaction.severity) }]}>
                        {severityLabel(interaction.severity)}
                      </Text>
                    </View>
                  </View>
                  <Text style={modalStyles.interactionNote}>{interaction.note}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── STYLES ──

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  tabChipTextActive: { color: '#FFF' },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 9,
    color: '#FFF',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  sectionLabel: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Prescription cards
  rxCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rxCardCompleted: { opacity: 0.7 },
  rxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rxIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rxIconActive: { backgroundColor: Colors.primary + '12' },
  rxIconCompleted: { backgroundColor: Colors.success + '12' },
  rxNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rxName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  rxDosage: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  rxFreq: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rxBottom: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '60',
  },
  rxMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rxMetaText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },

  // Refill cards
  refillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  refillBannerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#FFF',
  },
  refillBannerSub: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  refillCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refillTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refillUrgency: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgencySoon: { backgroundColor: Colors.error + '12' },
  urgencyUpcoming: { backgroundColor: Colors.warning + '12' },
  refillMedName: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  refillPharmacy: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  daysLeftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysLeftSoon: { backgroundColor: Colors.error + '12' },
  daysLeftUpcoming: { backgroundColor: Colors.warning + '12' },
  daysLeftText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
  },
  refillBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '60',
  },
  refillDueText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
  },
  refillRequestBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  refillRequestText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
  },

  // Nearby pharmacies
  pharmacyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pharmacyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pharmacyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pharmacyName: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pharmacyAddress: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  openBadgeOpen: { backgroundColor: Colors.success + '15' },
  openBadgeClosed: { backgroundColor: Colors.error + '15' },
  openBadgeText: { fontFamily: Fonts.semiBold, fontSize: 10 },
  pharmacyMeta: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '60',
  },
  pharmacyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pharmacyMetaText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  stockText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.success,
    flex: 1,
  },
  pharmacyActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pharmacyCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#FFF',
  },
  pharmacyCallText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  pharmacyDirectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  pharmacyDirectText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#FFF',
  },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sheetSub: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginLeft: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillActive: { backgroundColor: Colors.primary + '15' },
  statusPillCompleted: { backgroundColor: Colors.success + '15' },
  statusPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 16,
  },
  infoItem: { flex: 1 },
  infoLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  infoValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  instructionBox: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  instructionText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sideEffectsText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  interactionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  interactionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  interactionDrug: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
  },
  interactionNote: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
