import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Flask,
  Heartbeat,
  Syringe,
  Brain,
  CaretRight,
  X,
  CheckCircle,
  Warning,
  Clock,
  CalendarBlank,
  ArrowUp,
  ArrowDown,
  Minus,
  Shield,
  Info,
  Sparkle,
} from 'phosphor-react-native';
import { Colors, Fonts } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── TABS ──
type RecordTab = 'labs' | 'diagnoses' | 'vaccines' | 'ai';

const TABS: { key: RecordTab; label: string; icon: any }[] = [
  { key: 'labs', label: 'Lab Results', icon: Flask },
  { key: 'diagnoses', label: 'Diagnoses', icon: Heartbeat },
  { key: 'vaccines', label: 'Vaccines', icon: Syringe },
  { key: 'ai', label: 'AI Insights', icon: Brain },
];

// ── MOCK DATA ──

const LAB_RESULTS = [
  {
    id: '1',
    name: 'Complete Blood Count',
    date: 'Apr 15, 2026',
    status: 'normal' as const,
    facility: 'JDWNRH, Thimphu',
    items: [
      { label: 'Hemoglobin', value: '14.2 g/dL', range: '13.5–17.5', trend: 'stable' as const },
      { label: 'WBC Count', value: '7,200 /µL', range: '4,500–11,000', trend: 'stable' as const },
      { label: 'Platelets', value: '245,000 /µL', range: '150,000–400,000', trend: 'up' as const },
      { label: 'RBC Count', value: '5.1 M/µL', range: '4.7–6.1', trend: 'stable' as const },
    ],
  },
  {
    id: '2',
    name: 'Lipid Panel',
    date: 'Apr 10, 2026',
    status: 'attention' as const,
    facility: 'Thimphu Hospital',
    items: [
      { label: 'Total Cholesterol', value: '218 mg/dL', range: '<200', trend: 'up' as const },
      { label: 'LDL', value: '142 mg/dL', range: '<100', trend: 'up' as const },
      { label: 'HDL', value: '52 mg/dL', range: '>40', trend: 'stable' as const },
      { label: 'Triglycerides', value: '130 mg/dL', range: '<150', trend: 'down' as const },
    ],
  },
  {
    id: '3',
    name: 'Blood Glucose (Fasting)',
    date: 'Mar 28, 2026',
    status: 'normal' as const,
    facility: 'JDWNRH, Thimphu',
    items: [
      { label: 'Fasting Glucose', value: '92 mg/dL', range: '70–100', trend: 'stable' as const },
      { label: 'HbA1c', value: '5.4%', range: '<5.7%', trend: 'down' as const },
    ],
  },
  {
    id: '4',
    name: 'Thyroid Function',
    date: 'Mar 15, 2026',
    status: 'normal' as const,
    facility: 'Paro Hospital',
    items: [
      { label: 'TSH', value: '2.1 mIU/L', range: '0.4–4.0', trend: 'stable' as const },
      { label: 'Free T4', value: '1.2 ng/dL', range: '0.8–1.8', trend: 'stable' as const },
    ],
  },
];

const DIAGNOSES = [
  {
    id: '1',
    name: 'Essential Hypertension',
    icd: 'I10',
    date: 'Jan 12, 2025',
    status: 'active' as const,
    doctor: 'Dr. Karma Wangdi',
    notes: 'Stage 1 hypertension. Managed with Amlodipine 5mg. Blood pressure generally well controlled. Follow-up every 3 months.',
  },
  {
    id: '2',
    name: 'Type 2 Diabetes Mellitus',
    icd: 'E11',
    date: 'Aug 5, 2024',
    status: 'active' as const,
    doctor: 'Dr. Dechen Zangmo',
    notes: 'Managed with Metformin 500mg. HbA1c improving. Lifestyle modifications in progress. Diet counseling recommended.',
  },
  {
    id: '3',
    name: 'Seasonal Allergic Rhinitis',
    icd: 'J30.2',
    date: 'Mar 20, 2026',
    status: 'resolved' as const,
    doctor: 'Dr. Thinley Norbu',
    notes: 'Seasonal occurrence. Treated with antihistamines. Symptoms resolved.',
  },
  {
    id: '4',
    name: 'Lumbar Strain',
    icd: 'S39.012',
    date: 'Nov 8, 2025',
    status: 'resolved' as const,
    doctor: 'Dr. Tandin Dorji',
    notes: 'Acute lower back pain from lifting. Resolved with physiotherapy and rest.',
  },
];

const VACCINATIONS = [
  {
    id: '1',
    name: 'COVID-19 (Booster)',
    date: 'Feb 10, 2026',
    nextDue: null,
    facility: 'JDWNRH, Thimphu',
    batch: 'BNT162b2-2026A',
    status: 'completed' as const,
  },
  {
    id: '2',
    name: 'Influenza (Seasonal)',
    date: 'Oct 15, 2025',
    nextDue: 'Oct 2026',
    facility: 'Thimphu Hospital',
    batch: 'FLU-2025Q4',
    status: 'completed' as const,
  },
  {
    id: '3',
    name: 'Hepatitis B (Dose 3/3)',
    date: 'Jul 20, 2024',
    nextDue: null,
    facility: 'JDWNRH, Thimphu',
    batch: 'HEPB-2024C',
    status: 'completed' as const,
  },
  {
    id: '4',
    name: 'Tetanus (Td Booster)',
    date: 'Mar 5, 2022',
    nextDue: 'Mar 2032',
    facility: 'Paro Hospital',
    batch: 'TD-2022A',
    status: 'upcoming' as const,
  },
];

const AI_INSIGHTS = [
  {
    id: '1',
    title: 'Cholesterol Trend Analysis',
    summary: 'Your LDL cholesterol has been trending upward over the last 3 tests. At 142 mg/dL, it is above the recommended range of <100 mg/dL.',
    recommendation: 'Consider dietary changes: reduce saturated fats, increase fiber intake, and maintain regular exercise. Discuss statin therapy with your doctor if lifestyle changes are insufficient.',
    severity: 'moderate' as const,
    relatedTo: 'Lipid Panel — Apr 10, 2026',
    date: 'Apr 16, 2026',
  },
  {
    id: '2',
    title: 'Blood Pressure & Medication Effectiveness',
    summary: 'Your average blood pressure readings over the past 6 months (132/86 mmHg) show improvement from the initial diagnosis, but remain slightly above target (130/80).',
    recommendation: 'Continue Amlodipine as prescribed. Consider adding lifestyle modifications: sodium restriction, regular aerobic exercise 30 min/day, and stress management techniques.',
    severity: 'low' as const,
    relatedTo: 'Essential Hypertension — Active',
    date: 'Apr 14, 2026',
  },
  {
    id: '3',
    title: 'HbA1c Improvement Detected',
    summary: 'Your HbA1c has improved from 6.1% to 5.4% over the last 8 months, moving from pre-diabetic to normal range. This is excellent progress.',
    recommendation: 'Continue current medication and lifestyle changes. Your next HbA1c test is recommended in 3 months to confirm this positive trend.',
    severity: 'good' as const,
    relatedTo: 'Blood Glucose — Mar 28, 2026',
    date: 'Apr 12, 2026',
  },
];

// ── SCREEN ──

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState<RecordTab>('labs');
  const [selectedLab, setSelectedLab] = useState<(typeof LAB_RESULTS)[0] | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<(typeof DIAGNOSES)[0] | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<(typeof AI_INSIGHTS)[0] | null>(null);

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
            <Text style={styles.headerTitle}>Health Records</Text>
            <Text style={styles.headerSubtitle}>Your complete medical history</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {TABS.map((tab) => {
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
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {activeTab === 'labs' && (
          <>
            {LAB_RESULTS.map((lab) => (
              <TouchableOpacity
                key={lab.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => setSelectedLab(lab)}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.statusDot, lab.status === 'normal' ? styles.statusNormal : styles.statusAttention]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{lab.name}</Text>
                    <Text style={styles.cardMeta}>{lab.facility}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardDate}>{lab.date}</Text>
                    <CaretRight size={16} color={Colors.textMuted} />
                  </View>
                </View>
                <View style={styles.cardPreview}>
                  {lab.items.slice(0, 2).map((item, i) => (
                    <View key={i} style={styles.previewItem}>
                      <Text style={styles.previewLabel}>{item.label}</Text>
                      <Text style={styles.previewValue}>{item.value}</Text>
                    </View>
                  ))}
                  {lab.items.length > 2 && (
                    <Text style={styles.moreText}>+{lab.items.length - 2} more</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'diagnoses' && (
          <>
            {DIAGNOSES.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => setSelectedDiagnosis(d)}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.statusDot, d.status === 'active' ? styles.statusAttention : styles.statusNormal]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{d.name}</Text>
                    <Text style={styles.cardMeta}>ICD-10: {d.icd} · {d.doctor}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <View style={[styles.statusBadge, d.status === 'active' ? styles.statusBadgeActive : styles.statusBadgeResolved]}>
                      <Text style={[styles.statusBadgeText, d.status === 'active' ? styles.statusBadgeTextActive : styles.statusBadgeTextResolved]}>
                        {d.status === 'active' ? 'Active' : 'Resolved'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.diagnosisNotes} numberOfLines={2}>{d.notes}</Text>
                <Text style={styles.cardDateBottom}>Diagnosed: {d.date}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'vaccines' && (
          <>
            {VACCINATIONS.map((v) => (
              <View key={v.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.vaccineIcon, v.status === 'completed' ? styles.vaccineComplete : styles.vaccineUpcoming]}>
                    {v.status === 'completed' ? (
                      <CheckCircle size={18} color={Colors.success} weight="fill" />
                    ) : (
                      <Clock size={18} color={Colors.warning} weight="fill" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{v.name}</Text>
                    <Text style={styles.cardMeta}>{v.facility} · Batch: {v.batch}</Text>
                  </View>
                </View>
                <View style={styles.vaccineDetails}>
                  <View style={styles.vaccineDetail}>
                    <CalendarBlank size={14} color={Colors.textMuted} />
                    <Text style={styles.vaccineDetailText}>Administered: {v.date}</Text>
                  </View>
                  {v.nextDue && (
                    <View style={styles.vaccineDetail}>
                      <Clock size={14} color={Colors.warning} />
                      <Text style={[styles.vaccineDetailText, { color: Colors.warning }]}>Next due: {v.nextDue}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <LinearGradient
              colors={[Colors.primary, '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiBanner}
            >
              <View style={styles.aiBannerIcon}>
                <Sparkle size={20} color="#FFF" weight="fill" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiBannerTitle}>AI Health Analysis</Text>
                <Text style={styles.aiBannerSub}>Personalized insights based on your records</Text>
              </View>
            </LinearGradient>

            {AI_INSIGHTS.map((insight) => (
              <TouchableOpacity
                key={insight.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => setSelectedInsight(insight)}
              >
                <View style={styles.cardTop}>
                  <View style={[
                    styles.insightSeverity,
                    insight.severity === 'good' && styles.severityGood,
                    insight.severity === 'moderate' && styles.severityModerate,
                    insight.severity === 'low' && styles.severityLow,
                  ]}>
                    {insight.severity === 'good' ? (
                      <CheckCircle size={18} color={Colors.success} weight="fill" />
                    ) : insight.severity === 'moderate' ? (
                      <Warning size={18} color={Colors.warning} weight="fill" />
                    ) : (
                      <Info size={18} color={Colors.primary} weight="fill" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{insight.title}</Text>
                    <Text style={styles.cardMeta}>{insight.relatedTo}</Text>
                  </View>
                  <CaretRight size={16} color={Colors.textMuted} />
                </View>
                <Text style={styles.diagnosisNotes} numberOfLines={2}>{insight.summary}</Text>
                <Text style={styles.cardDateBottom}>{insight.date}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
      </ScrollView>

      {/* Lab Detail Modal */}
      <LabDetailModal lab={selectedLab} onClose={() => setSelectedLab(null)} />

      {/* Diagnosis Detail Modal */}
      <DiagnosisDetailModal diagnosis={selectedDiagnosis} onClose={() => setSelectedDiagnosis(null)} />

      {/* AI Insight Detail Modal */}
      <InsightDetailModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} />
    </SafeAreaView>
  );
}

// ── LAB DETAIL MODAL ──

function LabDetailModal({ lab, onClose }: { lab: (typeof LAB_RESULTS)[0] | null; onClose: () => void }) {
  if (!lab) return null;

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <ArrowUp size={14} color={Colors.warning} weight="bold" />;
    if (trend === 'down') return <ArrowDown size={14} color={Colors.success} weight="bold" />;
    return <Minus size={14} color={Colors.textMuted} weight="bold" />;
  };

  return (
    <Modal visible={!!lab} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.sheetTitle}>{lab.name}</Text>
              <Text style={modalStyles.sheetSub}>{lab.facility} · {lab.date}</Text>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[modalStyles.statusBar, lab.status === 'normal' ? modalStyles.statusBarNormal : modalStyles.statusBarAttention]}>
            {lab.status === 'normal' ? (
              <CheckCircle size={16} color={Colors.success} weight="fill" />
            ) : (
              <Warning size={16} color={Colors.warning} weight="fill" />
            )}
            <Text style={[modalStyles.statusBarText, lab.status === 'normal' ? { color: Colors.success } : { color: Colors.warning }]}>
              {lab.status === 'normal' ? 'All values within normal range' : 'Some values need attention'}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {lab.items.map((item, i) => (
              <View key={i} style={modalStyles.labRow}>
                <View style={{ flex: 1 }}>
                  <Text style={modalStyles.labLabel}>{item.label}</Text>
                  <Text style={modalStyles.labRange}>Ref: {item.range}</Text>
                </View>
                <View style={modalStyles.labValueWrap}>
                  <Text style={modalStyles.labValue}>{item.value}</Text>
                  <TrendIcon trend={item.trend} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── DIAGNOSIS DETAIL MODAL ──

function DiagnosisDetailModal({ diagnosis, onClose }: { diagnosis: (typeof DIAGNOSES)[0] | null; onClose: () => void }) {
  if (!diagnosis) return null;

  return (
    <Modal visible={!!diagnosis} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.sheetTitle}>{diagnosis.name}</Text>
              <Text style={modalStyles.sheetSub}>ICD-10: {diagnosis.icd} · {diagnosis.doctor}</Text>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[modalStyles.statusBar, diagnosis.status === 'active' ? modalStyles.statusBarAttention : modalStyles.statusBarNormal]}>
            <Shield size={16} color={diagnosis.status === 'active' ? Colors.warning : Colors.success} weight="fill" />
            <Text style={[modalStyles.statusBarText, { color: diagnosis.status === 'active' ? Colors.warning : Colors.success }]}>
              {diagnosis.status === 'active' ? 'Active condition — under treatment' : 'Resolved — no longer active'}
            </Text>
          </View>

          <View style={modalStyles.detailSection}>
            <Text style={modalStyles.detailLabel}>Diagnosed</Text>
            <Text style={modalStyles.detailValue}>{diagnosis.date}</Text>
          </View>
          <View style={modalStyles.detailSection}>
            <Text style={modalStyles.detailLabel}>Clinical Notes</Text>
            <Text style={modalStyles.detailNotes}>{diagnosis.notes}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── AI INSIGHT DETAIL MODAL ──

function InsightDetailModal({ insight, onClose }: { insight: (typeof AI_INSIGHTS)[0] | null; onClose: () => void }) {
  if (!insight) return null;

  return (
    <Modal visible={!!insight} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.sheetTitle}>{insight.title}</Text>
              <Text style={modalStyles.sheetSub}>{insight.relatedTo}</Text>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[
            modalStyles.statusBar,
            insight.severity === 'good' ? modalStyles.statusBarNormal : insight.severity === 'moderate' ? modalStyles.statusBarAttention : modalStyles.statusBarInfo,
          ]}>
            <Sparkle size={16} color={insight.severity === 'good' ? Colors.success : insight.severity === 'moderate' ? Colors.warning : Colors.primary} weight="fill" />
            <Text style={[modalStyles.statusBarText, {
              color: insight.severity === 'good' ? Colors.success : insight.severity === 'moderate' ? Colors.warning : Colors.primary,
            }]}>
              AI-generated insight · {insight.date}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={modalStyles.detailSection}>
              <Text style={modalStyles.detailLabel}>Analysis</Text>
              <Text style={modalStyles.detailNotes}>{insight.summary}</Text>
            </View>
            <View style={modalStyles.detailSection}>
              <Text style={modalStyles.detailLabel}>Recommendation</Text>
              <View style={modalStyles.recommendationBox}>
                <Text style={modalStyles.detailNotes}>{insight.recommendation}</Text>
              </View>
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
    paddingTop: 4,
    paddingBottom: 8,
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
  tabChipTextActive: {
    color: '#FFF',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Cards
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusNormal: { backgroundColor: Colors.success },
  statusAttention: { backgroundColor: Colors.warning },
  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  cardMeta: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardDate: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  cardPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '60',
  },
  previewItem: {},
  previewLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  previewValue: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  moreText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.primary,
    alignSelf: 'flex-end',
  },

  // Diagnosis
  diagnosisNotes: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 10,
    lineHeight: 18,
  },
  cardDateBottom: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeActive: { backgroundColor: Colors.warning + '18' },
  statusBadgeResolved: { backgroundColor: Colors.success + '18' },
  statusBadgeText: { fontFamily: Fonts.semiBold, fontSize: 10 },
  statusBadgeTextActive: { color: Colors.warning },
  statusBadgeTextResolved: { color: Colors.success },

  // Vaccines
  vaccineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaccineComplete: { backgroundColor: Colors.success + '15' },
  vaccineUpcoming: { backgroundColor: Colors.warning + '15' },
  vaccineDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '60',
    gap: 6,
  },
  vaccineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vaccineDetailText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // AI
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  aiBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBannerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#FFF',
  },
  aiBannerSub: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  insightSeverity: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityGood: { backgroundColor: Colors.success + '15' },
  severityModerate: { backgroundColor: Colors.warning + '15' },
  severityLow: { backgroundColor: Colors.primary + '15' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
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
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sheetSub: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  statusBarNormal: { backgroundColor: Colors.success + '12' },
  statusBarAttention: { backgroundColor: Colors.warning + '12' },
  statusBarInfo: { backgroundColor: Colors.primary + '12' },
  statusBarText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    flex: 1,
  },
  labRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '60',
  },
  labLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  labRange: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  labValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labValue: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  detailSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  detailLabel: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  detailNotes: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recommendationBox: {
    backgroundColor: Colors.primary + '08',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
});
