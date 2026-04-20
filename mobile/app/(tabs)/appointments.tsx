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
  FlatList,
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
  Stethoscope,
  CaretDown,
  Check,
  User,
  NoteBlank,
  CalendarCheck,
  ClockClockwise,
  MagnifyingGlass,
  Funnel,
  UserCircle,
  Phone,
  ArrowClockwise,
  SignIn,
  DotsThreeVertical,
  Warning,
} from 'phosphor-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors, Fonts } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

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

// --- SCREEN ---

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const isReceptionist = (user as any)?.role === 'receptionist';

  if (isReceptionist) {
    return <ReceptionistAppointmentsScreen />;
  }

  return <PatientAppointmentsScreen />;
}

function PatientAppointmentsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('upcoming');
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        {/* ── Tab Switcher ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'upcoming' && styles.tabChipActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab('upcoming')}
          >
            <CalendarCheck size={16} color={activeTab === 'upcoming' ? '#FFF' : Colors.textMuted} weight={activeTab === 'upcoming' ? 'fill' : 'regular'} />
            <Text style={[styles.tabChipText, activeTab === 'upcoming' && styles.tabChipTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'past' && styles.tabChipActive]}
            activeOpacity={0.7}
            onPress={() => setActiveTab('past')}
          >
            <ClockClockwise size={16} color={activeTab === 'past' ? '#FFF' : Colors.textMuted} weight={activeTab === 'past' ? 'fill' : 'regular'} />
            <Text style={[styles.tabChipText, activeTab === 'past' && styles.tabChipTextActive]}>
              Past
            </Text>
          </TouchableOpacity>
        </ScrollView>
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

        <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reason, setReason] = useState('');
  const drawerScrollRef = useRef<ScrollView>(null);
  const drawerRef = useRef<View>(null);
  const facilityBtnRef = useRef<View>(null);
  const departmentBtnRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{ top: number; left: number; width: number } | null>(null);

  const canSubmit = department && facility && selectedDate && selectedTime;

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
    setDropdownLayout(null);
  };

  const openDropdown = (ref: React.RefObject<any>, which: 'facility' | 'department') => {
    closeAllDropdowns();
    ref.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
      // Get drawer position to calculate relative offset
      drawerRef.current?.measureInWindow((dx: number, dy: number) => {
        setDropdownLayout({ top: y - dy + h + 4, left: x - dx, width: w });
        if (which === 'facility') setShowFacilities(true);
        else setShowDepartments(true);
      });
    });
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
        <View style={dStyles.drawer} ref={drawerRef}>
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
            {/* Facility */}
            <Text style={dStyles.label}>Facility</Text>
                <View ref={facilityBtnRef}>
                <TouchableOpacity
                  style={dStyles.dropdown}
                  activeOpacity={0.7}
                  onPress={() => showFacilities ? closeAllDropdowns() : openDropdown(facilityBtnRef, 'facility')}
                >
                  <MapPin size={16} color={Colors.textMuted} />
                  <Text style={[dStyles.dropdownText, !facility && dStyles.placeholder]}>{facility || 'Select facility'}</Text>
                  <CaretDown size={14} color={Colors.textMuted} />
                </TouchableOpacity>
                </View>

            {/* Department */}
            <Text style={dStyles.label}>Department</Text>
            <View ref={departmentBtnRef}>
            <TouchableOpacity
              style={dStyles.dropdown}
              activeOpacity={0.7}
              onPress={() => showDepartments ? closeAllDropdowns() : openDropdown(departmentBtnRef, 'department')}
            >
              <Stethoscope size={16} color={Colors.textMuted} />
              <Text style={[dStyles.dropdownText, !department && dStyles.placeholder]}>{department || 'Select department'}</Text>
              <CaretDown size={14} color={Colors.textMuted} />
            </TouchableOpacity>
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
                <View style={dStyles.summaryRow}>
                  <MapPin size={14} color={Colors.textMuted} />
                  <Text style={dStyles.summaryText}>{facility}</Text>
                </View>
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

          {/* Dropdown overlay — rendered outside ScrollView so scrolling works */}
          {(showFacilities || showDepartments) && dropdownLayout && (
            <>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeAllDropdowns}
              />
              <View
                style={[
                  dStyles.optionsList,
                  {
                    top: dropdownLayout.top,
                    left: dropdownLayout.left,
                    width: dropdownLayout.width,
                  },
                ]}
              >
                <ScrollView bounces={false} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
                  {(showFacilities ? FACILITIES : SPECIALTIES).map((item) => {
                    const isActive = showFacilities ? facility === item : department === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[dStyles.optionItem, isActive && dStyles.optionItemActive]}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (showFacilities) setFacility(item);
                          else setDepartment(item);
                          closeAllDropdowns();
                        }}
                      >
                        <Text style={[dStyles.optionText, isActive && dStyles.optionTextActive]}>{item}</Text>
                        {isActive && <Check size={14} color={Colors.primary} weight="bold" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          )}
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

  // Options (absolute overlay dropdown — rendered outside ScrollView)
  optionsList: {
    position: 'absolute',
    maxHeight: 5 * 44,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
    zIndex: 100,
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
    minHeight: 100,
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

  // Tab Bar (chip style)
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

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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

// =============================================
// RECEPTIONIST APPOINTMENTS VIEW
// =============================================

type RFilterStatus = 'all' | 'pending' | 'accepted' | 'checked_in' | 'in_progress' | 'completed' | 'rejected' | 'no_show';

const RECEPTIONIST_STATUS_FILTERS: { key: RFilterStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'checked_in', label: 'Checked In' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'no_show', label: 'No Show' },
];

const MOCK_RECEPTIONIST_APPOINTMENTS = [
  {
    id: '1',
    patientName: 'Tshering Dorji',
    patientPhone: '+975-17123456',
    patientInitials: 'TD',
    doctor: 'Dr. Karma Wangdi',
    department: 'General Physician',
    date: 'Today',
    time: '9:00 AM',
    tokenNo: 'A-001',
    type: 'in-person' as const,
    location: 'JDWNRH, Room 102',
    status: 'pending' as const,
    reason: 'Persistent headaches for the past week',
    requestedAt: '30 min ago',
  },
  {
    id: '2',
    patientName: 'Pema Lhamo',
    patientPhone: '+975-17234567',
    patientInitials: 'PL',
    doctor: 'Dr. Dechen Zangmo',
    department: 'Cardiologist',
    date: 'Today',
    time: '9:30 AM',
    tokenNo: 'A-002',
    type: 'in-person' as const,
    location: 'JDWNRH, Room 205',
    status: 'pending' as const,
    reason: 'Follow-up for chest pain',
    requestedAt: '1 hr ago',
  },
  {
    id: '3',
    patientName: 'Kinley Wangchuk',
    patientPhone: '+975-17345678',
    patientInitials: 'KW',
    doctor: 'Dr. Karma Wangdi',
    department: 'General Physician',
    date: 'Today',
    time: '10:00 AM',
    tokenNo: 'A-003',
    type: 'video' as const,
    location: 'Teleconsult',
    status: 'accepted' as const,
    reason: 'Skin rash consultation',
    requestedAt: '2 hrs ago',
  },
  {
    id: '4',
    patientName: 'Sonam Choden',
    patientPhone: '+975-17456789',
    patientInitials: 'SC',
    doctor: 'Dr. Tandin Dorji',
    department: 'Orthopedic',
    date: 'Today',
    time: '10:30 AM',
    tokenNo: 'A-004',
    type: 'in-person' as const,
    location: 'JDWNRH, Room 108',
    status: 'checked_in' as const,
    reason: 'Knee pain follow-up',
    requestedAt: 'Yesterday',
  },
  {
    id: '5',
    patientName: 'Dechen Pelden',
    patientPhone: '+975-17567890',
    patientInitials: 'DP',
    doctor: 'Dr. Pema Lhamo',
    department: 'Cardiologist',
    date: 'Today',
    time: '11:00 AM',
    tokenNo: 'A-005',
    type: 'in-person' as const,
    location: 'JDWNRH, Room 205',
    status: 'completed' as const,
    reason: 'Annual heart check-up',
    requestedAt: 'Last week',
  },
  {
    id: '6',
    patientName: 'Ugyen Tshomo',
    patientPhone: '+975-17678901',
    patientInitials: 'UT',
    doctor: 'Dr. Karma Wangdi',
    department: 'General Physician',
    date: 'Today',
    time: '11:30 AM',
    tokenNo: 'A-006',
    type: 'in-person' as const,
    location: 'JDWNRH, Room 102',
    status: 'no_show' as const,
    reason: 'Fever and body ache',
    requestedAt: '3 days ago',
  },
  {
    id: '7',
    patientName: 'Dorji Wangmo',
    patientPhone: '+975-17789012',
    patientInitials: 'DW',
    doctor: 'Dr. Sonam Choden',
    department: 'Neurologist',
    date: 'Today',
    time: '2:00 PM',
    tokenNo: 'A-007',
    type: 'in-person' as const,
    location: 'JDWNRH, Room 301',
    status: 'rejected' as const,
    reason: 'Migraine episodes',
    requestedAt: 'Yesterday',
  },
  {
    id: '8',
    patientName: 'Tandin Zam',
    patientPhone: '+975-17890123',
    patientInitials: 'TZ',
    doctor: 'Dr. Dechen Zangmo',
    department: 'Cardiologist',
    date: 'Today',
    time: '2:30 PM',
    tokenNo: 'A-008',
    type: 'in-person' as const,
    location: 'JDWNRH, Room 205',
    status: 'pending' as const,
    reason: 'Shortness of breath',
    requestedAt: '15 min ago',
  },
  {
    id: '9',
    patientName: 'Namgay Dema',
    patientPhone: '+975-17901234',
    patientInitials: 'ND',
    doctor: 'Dr. Tandin Dorji',
    department: 'Orthopedic',
    date: 'Today',
    time: '3:00 PM',
    tokenNo: 'A-009',
    type: 'in-person' as const,
    location: 'JDWNRH, Room 108',
    status: 'in_progress' as const,
    reason: 'Back pain for 2 weeks',
    requestedAt: '2 days ago',
  },
];

type RecAppointment = typeof MOCK_RECEPTIONIST_APPOINTMENTS[0];

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'accepted': return Colors.primary;
    case 'checked_in': return '#0891B2';
    case 'in_progress': return '#8B5CF6';
    case 'completed': return Colors.success;
    case 'rejected': return Colors.error;
    case 'no_show': return '#7C3AED';
    default: return Colors.textMuted;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending': return 'Pending';
    case 'accepted': return 'Accepted';
    case 'checked_in': return 'Checked In';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'rejected': return 'Rejected';
    case 'no_show': return 'No Show';
    default: return status;
  }
}

// --- Date Navigation Bar ---
function DateNavBar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const dates = (() => {
    const result: { label: string; value: string; dayName: string; dayNum: number }[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      result.push({
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
        value: d.toISOString().split('T')[0],
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
      });
    }
    return result;
  })();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={rStyles.dateNavRow}
    >
      {dates.map((d) => {
        const isActive = d.value === selectedDate;
        return (
          <TouchableOpacity
            key={d.value}
            style={[rStyles.dateNavChip, isActive && rStyles.dateNavChipActive]}
            activeOpacity={0.7}
            onPress={() => onSelect(d.value)}
          >
            <Text style={[rStyles.dateNavDay, isActive && rStyles.dateNavDayActive]}>{d.label}</Text>
            <Text style={[rStyles.dateNavNum, isActive && rStyles.dateNavNumActive]}>{d.dayNum}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// --- Stats Summary ---
function AppointmentStats({ appointments }: { appointments: RecAppointment[] }) {
  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const accepted = appointments.filter((a) => a.status === 'accepted').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  const stats = [
    { label: 'Total', value: total, color: Colors.textPrimary },
    { label: 'Pending', value: pending, color: '#F59E0B' },
    { label: 'Accepted', value: accepted, color: Colors.primary },
    { label: 'Done', value: completed, color: Colors.success },
  ];

  return (
    <View style={rStyles.statsRow}>
      {stats.map((s, i) => (
        <View key={i} style={rStyles.statCard}>
          <Text style={[rStyles.statValue, { color: s.color }]}>{s.value}</Text>
          <Text style={rStyles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

// --- Receptionist Appointment Card ---
function RecAppointmentCard({ appointment: apt }: { appointment: RecAppointment }) {
  const statusColor = getStatusColor(apt.status);
  const statusLabel = getStatusLabel(apt.status);
  const isPending = apt.status === 'pending';
  const isAccepted = apt.status === 'accepted';
  const isCheckedIn = apt.status === 'checked_in';
  const isRejected = apt.status === 'rejected';
  const isNoShow = apt.status === 'no_show';

  return (
    <View style={[rStyles.card, (isRejected || isNoShow) && { opacity: 0.7 }]}>
      {/* Top: Token + Status */}
      <View style={rStyles.cardTopRow}>
        <View style={rStyles.tokenBadge}>
          <Text style={rStyles.tokenText}>{apt.tokenNo}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={rStyles.requestedAt}>{apt.requestedAt}</Text>
          <View style={[rStyles.statusPill, { backgroundColor: statusColor + '15' }]}>
            <View style={[rStyles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[rStyles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      {/* Patient Info */}
      <View style={rStyles.patientRow}>
        <View style={rStyles.patientAvatar}>
          <Text style={rStyles.patientAvatarText}>{apt.patientInitials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rStyles.patientName}>{apt.patientName}</Text>
          <Text style={rStyles.patientPhone}>{apt.patientPhone}</Text>
        </View>
      </View>

      {/* Appointment Details */}
      <View style={rStyles.detailsGrid}>
        <View style={rStyles.detailItem}>
          <Stethoscope size={14} color={Colors.textMuted} />
          <Text style={rStyles.detailText}>{apt.doctor} · {apt.department}</Text>
        </View>
        <View style={rStyles.detailItem}>
          <CalendarBlank size={14} color={Colors.textMuted} />
          <Text style={rStyles.detailText}>{apt.date} · {apt.time}</Text>
        </View>
        <View style={rStyles.detailItem}>
          <MapPin size={14} color={Colors.textMuted} />
          <Text style={rStyles.detailText}>{apt.location}</Text>
        </View>
        {apt.reason ? (
          <View style={rStyles.detailItem}>
            <NoteBlank size={14} color={Colors.textMuted} />
            <Text style={rStyles.detailText} numberOfLines={2}>{apt.reason}</Text>
          </View>
        ) : null}
        {apt.type === 'video' && (
          <View style={rStyles.videoPill}>
            <VideoCamera size={12} color={Colors.primary} weight="fill" />
            <Text style={rStyles.videoPillText}>Video Consult</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={rStyles.cardActions}>
        {isPending && (
          <>
            <TouchableOpacity style={rStyles.acceptBtn} activeOpacity={0.8}>
              <CheckCircle size={15} color="#FFF" weight="bold" />
              <Text style={rStyles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={rStyles.rescheduleBtn} activeOpacity={0.7}>
              <ArrowClockwise size={14} color={Colors.primary} />
              <Text style={rStyles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={rStyles.rejectBtn} activeOpacity={0.7}>
              <XCircle size={14} color={Colors.error} />
            </TouchableOpacity>
          </>
        )}
        {isAccepted && (
          <View style={rStyles.acceptedIndicator}>
            <CheckCircle size={14} color={Colors.primary} weight="fill" />
            <Text style={rStyles.acceptedText}>Accepted — awaiting check-in</Text>
          </View>
        )}
        {isCheckedIn && (
          <View style={rStyles.waitingIndicator}>
            <ClockClockwise size={14} color="#0891B2" />
            <Text style={rStyles.waitingText}>Checked in — waiting for doctor</Text>
          </View>
        )}
        {(apt.status === 'completed' || isRejected || isNoShow) && (
          <TouchableOpacity style={rStyles.viewDetailsBtn} activeOpacity={0.7}>
            <Text style={rStyles.viewDetailsBtnText}>View Details</Text>
            <CaretRight size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
        {apt.status === 'in_progress' && (
          <View style={rStyles.inProgressIndicator}>
            <View style={rStyles.pulsingDot} />
            <Text style={rStyles.inProgressText}>Consultation in progress</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// --- Main Receptionist Screen ---
function ReceptionistAppointmentsScreen() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeFilter, setActiveFilter] = useState<RFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = MOCK_RECEPTIONIST_APPOINTMENTS.filter((apt) => {
    if (activeFilter !== 'all' && apt.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        apt.patientName.toLowerCase().includes(q) ||
        apt.doctor.toLowerCase().includes(q) ||
        apt.tokenNo.toLowerCase().includes(q) ||
        apt.patientPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={rStyles.safe}>
      <ScrollView
        style={rStyles.scroll}
        contentContainerStyle={rStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={rStyles.header}>
          <View>
            <Text style={rStyles.headerTitle}>Appointments</Text>
            <Text style={rStyles.headerSubtitle}>Manage patient requests</Text>
          </View>
        </View>

        {/* Date Navigation */}
        <DateNavBar selectedDate={selectedDate} onSelect={setSelectedDate} />

        {/* Stats */}
        <AppointmentStats appointments={MOCK_RECEPTIONIST_APPOINTMENTS} />

        {/* Search Bar */}
        <View style={rStyles.searchBar}>
          <MagnifyingGlass size={18} color={Colors.textMuted} />
          <TextInput
            style={rStyles.searchInput}
            placeholder="Search patient, doctor, or token..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={rStyles.filterRow}
        >
          {RECEPTIONIST_STATUS_FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            const count = f.key === 'all'
              ? MOCK_RECEPTIONIST_APPOINTMENTS.length
              : MOCK_RECEPTIONIST_APPOINTMENTS.filter((a) => a.status === f.key).length;
            return (
              <TouchableOpacity
                key={f.key}
                style={[rStyles.filterChip, isActive && rStyles.filterChipActive]}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[rStyles.filterChipText, isActive && rStyles.filterChipTextActive]}>
                  {f.label}
                </Text>
                <View style={[rStyles.filterCount, isActive && rStyles.filterCountActive]}>
                  <Text style={[rStyles.filterCountText, isActive && rStyles.filterCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Appointment Cards */}
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <RecAppointmentCard key={apt.id} appointment={apt} />
          ))
        ) : (
          <View style={rStyles.emptyWrap}>
            <CalendarBlank size={48} color={Colors.textMuted} weight="thin" />
            <Text style={rStyles.emptyText}>
              {searchQuery ? 'No matching appointments' : 'No appointments found'}
            </Text>
          </View>
        )}

        <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- RECEPTIONIST STYLES ---

const rStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FD' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 50 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Date Nav
  dateNavRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  dateNavChip: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 64,
  },
  dateNavChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  dateNavDay: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  dateNavDayActive: { color: Colors.primary },
  dateNavNum: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  dateNavNumActive: { color: Colors.primary },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 20,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textPrimary,
    padding: 0,
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textMuted,
  },
  filterChipTextActive: { color: '#FFF' },
  filterCount: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: Colors.textMuted,
  },
  filterCountTextActive: { color: '#FFF' },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tokenBadge: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tokenText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.primary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
  },

  // Patient
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientAvatarText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },
  patientName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  patientPhone: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Details
  detailsGrid: {
    gap: 8,
    marginBottom: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '80',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  videoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: Colors.primary + '12',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  videoPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.primary,
  },

  // Actions
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '80',
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 11,
  },
  acceptBtnText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: '#FFF',
  },
  rescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    backgroundColor: Colors.primaryLight,
  },
  rescheduleBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
  },
  rejectBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.error + '30',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '08',
  },
  acceptedIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  acceptedText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.primary,
  },
  requestedAt: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: Colors.textMuted,
  },
  waitingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0891B2' + '10',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  waitingText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#0891B2',
  },
  inProgressIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warning + '12',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
  },
  inProgressText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.warning,
  },
  viewDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  viewDetailsBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
  },

  // Empty
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
});
