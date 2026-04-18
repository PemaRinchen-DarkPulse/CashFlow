import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Platform,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  CalendarBlank,
  Clock,
  MapPin,
  VideoCamera,
  CaretRight,
  CaretLeft,
  CheckCircle,
  XCircle,
  NavigationArrow,
  X,
  Buildings,
  Stethoscope,
  CaretDown,
  Check,
  User,
  NoteBlank,
} from 'phosphor-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors, Fonts } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- MODAL CALENDAR PICKER ---
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function CalendarPickerModal({
  visible,
  selected,
  onSelect,
  onClose,
  minimumDate,
}: {
  visible: boolean;
  selected: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
  minimumDate?: Date;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() || today.getMonth());

  const monthName = new Date(viewYear, viewMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const isDisabled = (day: number) => {
    if (!minimumDate) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d < new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate());
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
  };

  const isToday = (day: number) => {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const canGoPrev = !minimumDate || viewYear > minimumDate.getFullYear() || (viewYear === minimumDate.getFullYear() && viewMonth > minimumDate.getMonth());

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={pickerModalStyles.overlay} onPress={onClose}>
        <Pressable style={pickerModalStyles.card} onPress={(e) => e.stopPropagation()}>
          <View style={pickerModalStyles.header}>
            <TouchableOpacity onPress={goPrev} activeOpacity={0.6} disabled={!canGoPrev} style={pickerModalStyles.navBtn}>
              <CaretLeft size={20} color={canGoPrev ? Colors.textPrimary : Colors.border} weight="bold" />
            </TouchableOpacity>
            <Text style={pickerModalStyles.title}>{monthName}</Text>
            <TouchableOpacity onPress={goNext} activeOpacity={0.6} style={pickerModalStyles.navBtn}>
              <CaretRight size={20} color={Colors.textPrimary} weight="bold" />
            </TouchableOpacity>
          </View>

          <View style={pickerModalStyles.weekRow}>
            {DAY_LABELS.map((d, i) => (
              <Text key={i} style={pickerModalStyles.weekDay}>{d}</Text>
            ))}
          </View>

          <View style={pickerModalStyles.grid}>
            {cells.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={pickerModalStyles.cell}
                activeOpacity={day && !isDisabled(day) ? 0.6 : 1}
                onPress={() => { if (day && !isDisabled(day)) { onSelect(new Date(viewYear, viewMonth, day)); onClose(); } }}
                disabled={!day || isDisabled(day)}
              >
                {day ? (
                  <View style={[
                    pickerModalStyles.cellCircle,
                    isToday(day) && !isSelected(day) && pickerModalStyles.cellCircleToday,
                    isSelected(day) && pickerModalStyles.cellCircleSelected,
                  ]}>
                    <Text style={[
                      pickerModalStyles.cellText,
                      isDisabled(day) && pickerModalStyles.cellDisabled,
                      isToday(day) && !isSelected(day) && pickerModalStyles.cellToday,
                      isSelected(day) && pickerModalStyles.cellTextSelected,
                    ]}>{day}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// --- MODAL TIME PICKER (Roller/Wheel) ---
const HOUR_DATA = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTE_DATA = Array.from({ length: 60 }, (_, i) => i);
const PERIOD_DATA: ('AM' | 'PM')[] = ['AM', 'PM'];
const ROLLER_ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 3;
const ROLLER_HEIGHT = ROLLER_ITEM_HEIGHT * VISIBLE_ITEMS;

function RollerColumn({
  data,
  selectedIndex,
  onChange,
  formatItem,
  circular = false,
}: {
  data: (string | number)[];
  selectedIndex: number;
  onChange: (index: number) => void;
  formatItem: (item: string | number) => string;
  circular?: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const mountedRef = useRef(false);
  const dataLen = data.length;

  // For circular scrolling, repeat data 3x and start in the middle set
  const displayData = circular ? [...data, ...data, ...data] : data;
  const middleOffset = circular ? dataLen : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      const scrollIndex = circular ? middleOffset + selectedIndex : selectedIndex;
      scrollRef.current?.scrollTo({ y: scrollIndex * ROLLER_ITEM_HEIGHT, animated: false });
      mountedRef.current = true;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollEnd = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const y = event.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(y / ROLLER_ITEM_HEIGHT);

    if (circular) {
      const realIndex = ((rawIndex % dataLen) + dataLen) % dataLen;
      if (realIndex !== selectedIndex) {
        onChange(realIndex);
      }
      // If scrolled outside the middle set, silently jump back
      if (rawIndex < dataLen || rawIndex >= dataLen * 2) {
        const targetIndex = dataLen + realIndex;
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: targetIndex * ROLLER_ITEM_HEIGHT, animated: false });
        }, 50);
      }
    } else {
      const clamped = Math.max(0, Math.min(rawIndex, dataLen - 1));
      if (clamped !== selectedIndex) {
        onChange(clamped);
      }
    }
  }, [dataLen, selectedIndex, onChange, circular]);

  return (
    <View style={rollerStyles.columnWrap}>
      {/* Highlight band for selected row */}
      <View style={rollerStyles.selectedBand} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROLLER_ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: ROLLER_ITEM_HEIGHT,
        }}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
      >
        {displayData.map((item, i) => {
          const realIndex = circular ? i % dataLen : i;
          const isActive = realIndex === selectedIndex;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.6}
              onPress={() => {
                onChange(realIndex);
                scrollRef.current?.scrollTo({ y: i * ROLLER_ITEM_HEIGHT, animated: true });
              }}
              style={rollerStyles.item}
            >
              <Text style={[rollerStyles.itemText, isActive && rollerStyles.itemTextActive]}>
                {formatItem(item)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TimePickerModal({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const getDefaults = useCallback(() => {
    const d = selected || new Date();
    return {
      hour: ((d.getHours() % 12) || 12) - 1,
      minute: d.getMinutes(),
      period: d.getHours() >= 12 ? 1 : 0,
    };
  }, [selected]);

  const [hourIdx, setHourIdx] = useState(() => getDefaults().hour);
  const [minuteIdx, setMinuteIdx] = useState(() => getDefaults().minute);
  const [periodIdx, setPeriodIdx] = useState(() => getDefaults().period);

  // Reset to current time each time modal opens
  useEffect(() => {
    if (visible) {
      const d = getDefaults();
      setHourIdx(d.hour);
      setMinuteIdx(d.minute);
      setPeriodIdx(d.period);
    }
  }, [visible]);

  const currentHour = HOUR_DATA[hourIdx];
  const currentMinute = MINUTE_DATA[minuteIdx];
  const currentPeriod = PERIOD_DATA[periodIdx];

  const handleConfirm = () => {
    const d = new Date();
    let h = currentHour;
    if (currentPeriod === 'AM' && h === 12) h = 0;
    else if (currentPeriod === 'PM' && h !== 12) h += 12;
    d.setHours(h, currentMinute, 0, 0);
    onSelect(d);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={pickerModalStyles.overlay} onPress={onClose}>
        <Pressable style={pickerModalStyles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={[pickerModalStyles.title, { textAlign: 'center', marginBottom: 4 }]}>Select Time</Text>

          {/* Column labels */}
          <View style={rollerStyles.labelRow}>
            <Text style={rollerStyles.colLabel}>Hour</Text>
            <Text style={rollerStyles.colLabel}>Min</Text>
            <Text style={rollerStyles.colLabel}></Text>
          </View>

          {/* Roller columns */}
          <View style={rollerStyles.columnsRow}>
            <RollerColumn
              data={HOUR_DATA}
              selectedIndex={hourIdx}
              onChange={setHourIdx}
              formatItem={(item) => String(item)}
              circular
            />
            <View style={rollerStyles.separator}>
              <Text style={rollerStyles.separatorText}>:</Text>
            </View>
            <RollerColumn
              data={MINUTE_DATA}
              selectedIndex={minuteIdx}
              onChange={setMinuteIdx}
              formatItem={(item) => String(item).padStart(2, '0')}
              circular
            />
            <RollerColumn
              data={PERIOD_DATA}
              selectedIndex={periodIdx}
              onChange={setPeriodIdx}
              formatItem={(item) => String(item)}
            />
          </View>

          {/* Preview + Confirm */}
          <Text style={pickerModalStyles.preview}>{currentHour}:{String(currentMinute).padStart(2, '0')} {currentPeriod}</Text>
          <TouchableOpacity style={pickerModalStyles.confirmBtn} activeOpacity={0.8} onPress={handleConfirm}>
            <Text style={pickerModalStyles.confirmText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const rollerStyles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  colLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROLLER_HEIGHT,
    marginBottom: 16,
  },
  columnWrap: {
    flex: 1,
    height: ROLLER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedBand: {
    position: 'absolute',
    top: ROLLER_ITEM_HEIGHT,
    left: 4,
    right: 4,
    height: ROLLER_ITEM_HEIGHT,
    backgroundColor: Colors.primary + '12',
    borderRadius: 10,
    zIndex: 1,
  },
  item: {
    height: ROLLER_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textMuted,
  },
  itemTextActive: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.primary,
  },
  separator: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separatorText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
});

const pickerModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellCircleSelected: {
    backgroundColor: Colors.primary,
  },
  cellCircleToday: {
    backgroundColor: Colors.primary + '20',
  },
  cellText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cellDisabled: {
    color: Colors.border,
  },
  cellToday: {
    color: Colors.primary,
    fontFamily: Fonts.bold,
  },
  cellTextSelected: {
    color: '#FFF',
    fontFamily: Fonts.bold,
  },
  preview: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#FFF',
  },
});

// --- MOCK DATA ---

const UPCOMING_APPOINTMENTS = [
  {
    id: '1',
    doctor: 'Dr. Karma Wangdi',
    specialty: 'General Physician',
    initials: 'DKW',
    date: 'Today',
    time: '2:30 PM',
    type: 'video' as const,
    location: 'JDWNRH Outpatient',
    status: 'scheduled' as const,
  },
  {
    id: '2',
    doctor: 'Dr. Dechen Zangmo',
    specialty: 'Cardiologist',
    initials: 'DDZ',
    date: 'Tomorrow',
    time: '10:00 AM',
    type: 'in-person' as const,
    location: 'Thimphu Hospital',
    status: 'scheduled' as const,
  },
  {
    id: '3',
    doctor: 'Dr. Tandin Dorji',
    specialty: 'Sowa Rigpa',
    initials: 'DTD',
    date: 'Apr 22, 2026',
    time: '3:00 PM',
    type: 'in-person' as const,
    location: 'Indigenous Hospital',
    status: 'scheduled' as const,
  },
];

const PAST_APPOINTMENTS = [
  {
    id: '4',
    doctor: 'Dr. Sonam Choden',
    specialty: 'Orthopedic',
    initials: 'DSC',
    date: 'Apr 10, 2026',
    time: '10:00 AM',
    type: 'in-person' as const,
    location: 'JDWNRH, Thimphu',
    status: 'completed' as const,
  },
  {
    id: '5',
    doctor: 'Dr. Karma Wangdi',
    specialty: 'General Physician',
    initials: 'DKW',
    date: 'Apr 5, 2026',
    time: '3:00 PM',
    type: 'video' as const,
    location: 'JDWNRH, Thimphu',
    status: 'completed' as const,
  },
  {
    id: '6',
    doctor: 'Dr. Pema Lhamo',
    specialty: 'Cardiologist',
    initials: 'DPL',
    date: 'Mar 28, 2026',
    time: '1:30 PM',
    type: 'in-person' as const,
    location: 'Thimphu Hospital',
    status: 'cancelled' as const,
  },
];

// --- BOOKING FORM DATA ---

const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Neurologist',
  'Orthopedic',
  'Dermatologist',
  'Pediatrician',
  'Sowa Rigpa',
  'ENT Specialist',
  'Ophthalmologist',
  'Psychiatrist',
];

const DOCTORS_MAP: Record<string, { name: string; initials: string; available: string }[]> = {
  'General Physician': [
    { name: 'Dr. Karma Wangdi', initials: 'DKW', available: 'Today, Tomorrow' },
    { name: 'Dr. Thinley Norbu', initials: 'DTN', available: 'Mon, Wed, Fri' },
  ],
  Cardiologist: [
    { name: 'Dr. Dechen Zangmo', initials: 'DDZ', available: 'Tue, Thu' },
    { name: 'Dr. Pema Lhamo', initials: 'DPL', available: 'Mon, Wed' },
  ],
  Neurologist: [
    { name: 'Dr. Sonam Choden', initials: 'DSC', available: 'Wed, Fri' },
  ],
  Orthopedic: [
    { name: 'Dr. Tandin Dorji', initials: 'DTD', available: 'Mon, Tue, Thu' },
  ],
  'Sowa Rigpa': [
    { name: 'Dr. Tandin Dorji', initials: 'DTD', available: 'Mon\u2013Fri' },
  ],
};

const FACILITIES = [
  'JDWNRH, Thimphu',
  'Thimphu Hospital',
  'Paro Hospital',
  'Indigenous Hospital',
  'Punakha Hospital',
];

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM',
];

const BOOKING_DATES = (() => {
  const dates: { label: string; value: string; day: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    dates.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${monthNames[d.getMonth()]} ${d.getDate()}`,
      value: d.toISOString().split('T')[0],
      day: dayNames[d.getDay()],
    });
  }
  return dates;
})();

type TabKey = 'upcoming' | 'past';
type VisitType = 'in-person' | 'video';

// --- SCREEN ---

export default function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Appointments</Text>
          <Text style={styles.headerSubtitle}>Manage your healthcare visits</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setDrawerVisible(true)}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryMid]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newBtn}
          >
            <Plus size={22} color="#FFF" weight="bold" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Tab Switcher (underline style) ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Appointment Cards ── */}
        {activeTab === 'upcoming' ? (
          UPCOMING_APPOINTMENTS.length > 0 ? (
            UPCOMING_APPOINTMENTS.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          ) : (
            <EmptyState message="No upcoming appointments" />
          )
        ) : PAST_APPOINTMENTS.length > 0 ? (
          PAST_APPOINTMENTS.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} isPast />
          ))
        ) : (
          <EmptyState message="No past appointments" />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Booking Drawer ── */}
      <BookingDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}

// --- BOOKING DRAWER ---

function BookingDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [department, setDepartment] = useState('');
  const [showDepartments, setShowDepartments] = useState(false);
  const [facility, setFacility] = useState('');
  const [showFacilities, setShowFacilities] = useState(false);
  const [visitType, setVisitType] = useState<VisitType>('in-person');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reason, setReason] = useState('');
  const drawerScrollRef = useRef<ScrollView>(null);

  const canSubmit = department && (visitType === 'video' || facility) && selectedDate && selectedTime;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const resetForm = () => {
    setDepartment('');
    setShowDepartments(false);
    setFacility('');
    setShowFacilities(false);
    setVisitType('in-person');
    setSelectedDate(null);
    setSelectedTime(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setReason('');
  };

  const handleConfirm = () => {
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const closeAllDropdowns = () => {
    setShowDepartments(false);
    setShowFacilities(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={dStyles.overlay}>
        <Pressable style={dStyles.backdrop} onPress={handleClose} />
        <View style={dStyles.drawer}>
          {/* Handle bar */}
          <View style={dStyles.handleBar} />

          {/* Drawer Header */}
          <View style={dStyles.drawerHeader}>
            <Text style={dStyles.drawerTitle}>Book Appointment</Text>
            <TouchableOpacity style={dStyles.closeBtn} activeOpacity={0.7} onPress={handleClose}>
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              ref={drawerScrollRef}
              style={dStyles.scroll}
              contentContainerStyle={dStyles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            {/* Visit Type */}
            <Text style={dStyles.label}>Visit Type</Text>
            <View style={dStyles.visitTypeRow}>
              <TouchableOpacity
                style={[dStyles.visitTypeBtn, visitType === 'in-person' && dStyles.visitTypeBtnActive]}
                activeOpacity={0.7}
                onPress={() => setVisitType('in-person')}
              >
                <Buildings size={18} color={visitType === 'in-person' ? Colors.primary : Colors.textMuted} weight={visitType === 'in-person' ? 'fill' : 'regular'} />
                <Text style={[dStyles.visitTypeText, visitType === 'in-person' && dStyles.visitTypeTextActive]}>In-Person</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dStyles.visitTypeBtn, visitType === 'video' && dStyles.visitTypeBtnActive]}
                activeOpacity={0.7}
                onPress={() => setVisitType('video')}
              >
                <VideoCamera size={18} color={visitType === 'video' ? Colors.primary : Colors.textMuted} weight={visitType === 'video' ? 'fill' : 'regular'} />
                <Text style={[dStyles.visitTypeText, visitType === 'video' && dStyles.visitTypeTextActive]}>Video Call</Text>
              </TouchableOpacity>
            </View>

            {/* Facility (in-person only) */}
            {visitType === 'in-person' && (
              <>
                <Text style={dStyles.label}>Facility</Text>
                <View style={{ zIndex: 20 }}>
                  <TouchableOpacity
                    style={dStyles.dropdown}
                    activeOpacity={0.7}
                    onPress={() => { setShowFacilities(!showFacilities); setShowDepartments(false); }}
                  >
                    <MapPin size={16} color={Colors.textMuted} />
                    <Text style={[dStyles.dropdownText, !facility && dStyles.placeholder]}>{facility || 'Select facility'}</Text>
                    <CaretDown size={14} color={Colors.textMuted} />
                  </TouchableOpacity>
                  {showFacilities && (
                    <View style={dStyles.optionsList}>
                      <ScrollView nestedScrollEnabled bounces={false} showsVerticalScrollIndicator={true}>
                        {FACILITIES.map((f) => (
                          <TouchableOpacity
                            key={f}
                            style={[dStyles.optionItem, facility === f && dStyles.optionItemActive]}
                            activeOpacity={0.7}
                            onPress={() => { setFacility(f); setShowFacilities(false); }}
                          >
                            <Text style={[dStyles.optionText, facility === f && dStyles.optionTextActive]}>{f}</Text>
                            {facility === f && <Check size={14} color={Colors.primary} weight="bold" />}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Department */}
            <Text style={dStyles.label}>Department</Text>
            <View style={{ zIndex: 10 }}>
              <TouchableOpacity
                style={dStyles.dropdown}
                activeOpacity={0.7}
                onPress={() => { setShowDepartments(!showDepartments); setShowFacilities(false); }}
              >
                <Stethoscope size={16} color={Colors.textMuted} />
                <Text style={[dStyles.dropdownText, !department && dStyles.placeholder]}>{department || 'Select department'}</Text>
                <CaretDown size={14} color={Colors.textMuted} />
              </TouchableOpacity>
              {showDepartments && (
                <View style={dStyles.optionsList}>
                  <ScrollView nestedScrollEnabled bounces={false} showsVerticalScrollIndicator={true}>
                    {SPECIALTIES.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[dStyles.optionItem, department === s && dStyles.optionItemActive]}
                        activeOpacity={0.7}
                        onPress={() => { setDepartment(s); setShowDepartments(false); }}
                      >
                        <Text style={[dStyles.optionText, department === s && dStyles.optionTextActive]}>{s}</Text>
                        {department === s && <Check size={14} color={Colors.primary} weight="bold" />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Date & Time */}
            <Text style={dStyles.label}>Date & Time</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[dStyles.dropdown, { flex: 1 }]}
                activeOpacity={0.7}
                onPress={() => { setShowDatePicker(true); setShowTimePicker(false); closeAllDropdowns(); }}
              >
                <CalendarBlank size={16} color={Colors.textMuted} />
                <Text style={[dStyles.dropdownText, !selectedDate && dStyles.placeholder]} numberOfLines={1}>
                  {selectedDate ? formatDate(selectedDate) : 'Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dStyles.dropdown, { flex: 1 }]}
                activeOpacity={0.7}
                onPress={() => { setShowTimePicker(true); setShowDatePicker(false); closeAllDropdowns(); }}
              >
                <Clock size={16} color={Colors.textMuted} />
                <Text style={[dStyles.dropdownText, !selectedTime && dStyles.placeholder]} numberOfLines={1}>
                  {selectedTime ? formatTime(selectedTime) : 'Time'}
                </Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <CalendarPickerModal
                visible={showDatePicker}
                selected={selectedDate}
                minimumDate={new Date()}
                onSelect={(date) => setSelectedDate(date)}
                onClose={() => setShowDatePicker(false)}
              />
            )}
            {showTimePicker && (
              <TimePickerModal
                visible={showTimePicker}
                selected={selectedTime}
                onSelect={(date) => setSelectedTime(date)}
                onClose={() => setShowTimePicker(false)}
              />
            )}

            {/* Reason */}
            <Text style={dStyles.label}>Reason for Visit <Text style={dStyles.optionalTag}>(optional)</Text></Text>
            <View style={dStyles.textAreaWrap}>
              <NoteBlank size={16} color={Colors.textMuted} style={{ marginTop: 2 }} />
              <TextInput
                style={dStyles.textArea}
                placeholder="Briefly describe your symptoms or reason..."
                placeholderTextColor={Colors.textMuted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onFocus={() => {
                  closeAllDropdowns();
                  setTimeout(() => {
                    drawerScrollRef.current?.scrollToEnd({ animated: true });
                  }, 300);
                }}
              />
            </View>

            {/* Summary */}
            {canSubmit ? (
              <View style={dStyles.summaryCard}>
                <Text style={dStyles.summaryTitle}>Appointment Summary</Text>
                <View style={dStyles.summaryRow}>
                  <Stethoscope size={14} color={Colors.textMuted} />
                  <Text style={dStyles.summaryText}>{department}</Text>
                </View>
                {visitType === 'in-person' && facility ? (
                  <View style={dStyles.summaryRow}>
                    <MapPin size={14} color={Colors.textMuted} />
                    <Text style={dStyles.summaryText}>{facility}</Text>
                  </View>
                ) : (
                  <View style={dStyles.summaryRow}>
                    <VideoCamera size={14} color={Colors.textMuted} />
                    <Text style={dStyles.summaryText}>Video Call</Text>
                  </View>
                )}
                <View style={dStyles.summaryRow}>
                  <CalendarBlank size={14} color={Colors.textMuted} />
                  <Text style={dStyles.summaryText}>{selectedDate ? formatDate(selectedDate) : ''} at {selectedTime ? formatTime(selectedTime) : ''}</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
          </KeyboardAvoidingView>

          {/* Confirm Button */}
          <View style={dStyles.bottomBar}>
            <TouchableOpacity
              style={[dStyles.confirmBtn, !canSubmit && dStyles.confirmBtnDisabled]}
              activeOpacity={canSubmit ? 0.8 : 1}
              onPress={canSubmit ? handleConfirm : undefined}
            >
              <CalendarBlank size={18} color="#FFF" weight="bold" />
              <Text style={dStyles.confirmBtnText}>Confirm Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// --- DRAWER STYLES ---

const dStyles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FD',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drawerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },

  label: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 18,
    marginBottom: 8,
  },
  optionalTag: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },

  // Visit type
  visitTypeRow: { flexDirection: 'row', gap: 10 },
  visitTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  visitTypeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  visitTypeText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textMuted },
  visitTypeTextActive: { color: Colors.primary },

  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownDisabled: { opacity: 0.5 },
  dropdownText: { flex: 1, fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.textPrimary },
  placeholder: { color: Colors.textMuted, fontFamily: Fonts.medium },

  // Options
  optionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 205,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '60',
  },
  optionItemActive: { backgroundColor: Colors.primaryLight },
  optionText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textPrimary },
  optionTextActive: { fontFamily: Fonts.semiBold, color: Colors.primary },

  // Doctor option
  doctorOption: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  doctorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: { fontFamily: Fonts.bold, fontSize: 10, color: Colors.primary },
  doctorAvail: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.textMuted, marginTop: 1 },

  // Date
  dateRow: { gap: 8, paddingRight: 20 },
  dateChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 66,
  },
  dateChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dateChipDay: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateChipDayActive: { color: Colors.primary },
  dateChipLabel: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.textPrimary },
  dateChipLabelActive: { color: Colors.primary },

  // Time
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  timeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  timeChipText: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.textSecondary },
  timeChipTextActive: { color: Colors.primary },

  // Text area
  textAreaWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 60,
    padding: 0,
  },

  // Summary
  summaryCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  summaryTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.primary, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  summaryText: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.textSecondary },

  // Bottom
  bottomBar: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
  },
  confirmBtnDisabled: { backgroundColor: Colors.primary + '40' },
  confirmBtnText: { fontFamily: Fonts.bold, fontSize: 15, color: '#FFF' },
});

// --- APPOINTMENT COMPONENTS ---

function AppointmentCard({
  appointment: apt,
  isPast,
}: {
  appointment: (typeof UPCOMING_APPOINTMENTS)[0] | (typeof PAST_APPOINTMENTS)[0];
  isPast?: boolean;
}) {
  const isCancelled = apt.status === 'cancelled';
  const isCompleted = apt.status === 'completed';
  const isToday = apt.date === 'Today';

  const statusColor = isCancelled
    ? Colors.error
    : isCompleted
      ? Colors.success
      : Colors.primary;
  const statusLabel = isCancelled
    ? 'Cancelled'
    : isCompleted
      ? 'Completed'
      : 'Scheduled';

  return (
    <View style={[styles.card, isCancelled && styles.cardCancelled]}>
      {/* ── Doctor Row ── */}
      <View style={styles.doctorRow}>
        <View style={[styles.avatarCircle, isCancelled && { opacity: 0.5 }]}>
          <Text style={styles.avatarInitials}>{apt.initials}</Text>
        </View>
        <View style={styles.doctorInfo}>
          <View style={styles.doctorNameRow}>
            <Text
              style={[styles.doctorName, isCancelled && { color: Colors.textMuted }]}
              numberOfLines={1}
            >
              {apt.doctor}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.doctorSpecialty}>{apt.specialty}</Text>
        </View>
      </View>

      {/* ── Meta Grid ── */}
      <View style={styles.metaGrid}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarBlank size={15} color={Colors.textMuted} />
            <Text style={styles.metaText}>{apt.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={15} color={Colors.textMuted} />
            <Text style={styles.metaText}>{apt.time}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={15} color={Colors.textMuted} />
            <Text style={styles.metaText}>{apt.location}</Text>
          </View>
          {apt.type === 'video' && (
            <View style={styles.videoBadge}>
              <VideoCamera size={13} color={Colors.primary} weight="fill" />
              <Text style={styles.videoBadgeText}>Video</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.cardActions}>
        {isCancelled ? (
          <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Rebook Appointment</Text>
          </TouchableOpacity>
        ) : isCompleted ? (
          <>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7}>
              <Text style={styles.outlineBtnText}>Book Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>View Summary</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7}>
              <Text style={styles.outlineBtnText}>Reschedule</Text>
            </TouchableOpacity>
            {apt.type === 'video' && isToday ? (
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
                <Text style={styles.primaryBtnText}>Join Call</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
                <NavigationArrow size={15} color="#FFF" weight="fill" />
                <Text style={styles.primaryBtnText}>Get Directions</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyWrap}>
      <CalendarBlank size={48} color={Colors.textMuted} weight="thin" />
      <Text style={styles.emptyText}>{message}</Text>
      <TouchableOpacity style={styles.emptyBtn} activeOpacity={0.7}>
        <Plus size={16} color={Colors.primary} weight="bold" />
        <Text style={styles.emptyBtnText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FD' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 50 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  newBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab Bar (underline style)
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCancelled: {
    opacity: 0.7,
  },

  // Doctor Row
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },
  doctorInfo: { flex: 1 },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 3,
  },
  doctorName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    flex: 1,
  },
  doctorSpecialty: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },

  // Status Badge
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
  },

  // Meta Grid
  metaGrid: {
    gap: 10,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '12',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  videoBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
  },

  // Action Buttons
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#FFF',
  },

  // Empty State
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textMuted,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '14',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 4,
  },
  emptyBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
});
