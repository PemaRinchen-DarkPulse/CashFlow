import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type StatusType = 'All' | 'Waiting' | 'In Progress' | 'Completed';

const MOCK_QUEUE = [
  { id: '1', queueNumber: 'Q-042', patientName: 'Karma Wangchuk', doctorName: 'Dr. Sonam Tobgay', department: 'General Medicine', status: 'In Progress', waitTime: '0 min', time: '10:30 AM' },
  { id: '2', queueNumber: 'Q-043', patientName: 'Dechen Pelden', doctorName: 'Dr. Sonam Tobgay', department: 'General Medicine', status: 'Waiting', waitTime: '15 mins', time: '10:45 AM' },
  { id: '3', queueNumber: 'P-012', patientName: 'Kinley Dema', doctorName: 'Dr. Pema Dorji', department: 'Pediatrics', status: 'Waiting', waitTime: '25 mins', time: '11:00 AM' },
  { id: '4', queueNumber: 'Q-041', patientName: 'Tashi Choden', doctorName: 'Dr. Sonam Tobgay', department: 'General Medicine', status: 'Completed', waitTime: '0 min', time: '10:00 AM' },
  { id: '5', queueNumber: 'C-008', patientName: 'Tshering Penjor', doctorName: 'Dr. Ugyen Wangdi', department: 'Cardiology', status: 'Waiting', waitTime: '45 mins', time: '11:30 AM' },
];

export default function QueueScreen() {
  const [activeTab, setActiveTab] = useState<StatusType>('All');

  const filteredQueue = MOCK_QUEUE.filter(item => 
    activeTab === 'All' ? true : item.status === activeTab
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'In Progress': return Colors.primary;
      case 'Waiting': return Colors.warning;
      case 'Completed': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch(status) {
      case 'In Progress': return Colors.primaryLight;
      case 'Waiting': return '#FEF3C7';
      case 'Completed': return '#D1FAE5';
      default: return Colors.background;
    }
  };

  const renderQueueItem = ({ item }: { item: typeof MOCK_QUEUE[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.queueNumberContainer}>
          <Text style={styles.queueNumber}>{item.queueNumber}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
      
      <View style={styles.cardRight}>
        <View style={styles.headerRow}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="medical-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{item.doctorName} • {item.department}</Text>
        </View>
        
        {item.status === 'Waiting' && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={Colors.warning} />
            <Text style={[styles.infoText, { color: Colors.warning, fontFamily: Fonts.bold }]}>Wait Time: {item.waitTime}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          {item.status === 'Waiting' && (
             <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]}>
                <Text style={styles.btnTextPrimary}>Call Next</Text>
             </TouchableOpacity>
          )}
          {item.status === 'In Progress' && (
             <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]}>
                <Text style={styles.btnTextPrimary}>Complete</Text>
             </TouchableOpacity>
          )}
          {item.status !== 'Completed' && (
            <TouchableOpacity style={styles.actionBtnOutline}>
              <Text style={styles.btnTextOutline}>Reschedule</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Queue</Text>
        <TouchableOpacity style={styles.scannerButton}>
          <Ionicons name="qr-code-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
         <View style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Total Today</Text>
         </View>
         <View style={[styles.statCard, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border }]}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>12</Text>
            <Text style={styles.statLabel}>Waiting</Text>
         </View>
         <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>8</Text>
            <Text style={styles.statLabel}>Completed</Text>
         </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {(['All', 'Waiting', 'In Progress', 'Completed'] as StatusType[]).map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredQueue}
        keyExtractor={item => item.id}
        renderItem={renderQueueItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color={Colors.success} />
            <Text style={styles.emptyText}>Queue is empty for this status.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  scannerButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    marginBottom: Spacing.md,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTab: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  tabText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardLeft: {
    width: 80,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  queueNumberContainer: {
    alignItems: 'center',
  },
  queueNumber: {
    fontFamily: Fonts.extraBold,
    fontSize: 16,
    color: Colors.primaryDark,
  },
  timeText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  cardRight: {
    flex: 1,
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  patientName: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  infoText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  btnTextPrimary: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.white,
  },
  actionBtnOutline: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnTextOutline: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
