import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const MOCK_PATIENTS = [
  { id: '1', name: 'Karma Wangchuk', cid: '11410001234', dob: '14 May 1985', gender: 'Male', phone: '+975 17123456', lastVisit: '10 Apr 2026' },
  { id: '2', name: 'Dechen Pelden', cid: '10902005678', dob: '22 Aug 1992', gender: 'Female', phone: '+975 17890123', lastVisit: '15 Apr 2026' },
  { id: '3', name: 'Sonam Dorji', cid: '11503009012', dob: '05 Nov 1978', gender: 'Male', phone: '+975 77234567', lastVisit: '20 Apr 2026' },
  { id: '4', name: 'Kinley Dema', cid: '10204003456', dob: '19 Jan 1995', gender: 'Female', phone: '+975 17567890', lastVisit: '02 Mar 2026' },
  { id: '5', name: 'Tenzin Gyeltshen', cid: '11105007890', dob: '30 Dec 1980', gender: 'Male', phone: '+975 77345678', lastVisit: '18 Apr 2026' },
];

export default function PatientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.cid.includes(searchQuery) ||
    patient.phone.includes(searchQuery)
  );

  const renderPatientCard = ({ item }: { item: typeof MOCK_PATIENTS[0] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.name.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientInfo}>{item.gender}, {item.dob}</Text>
        </View>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color={Colors.textMuted} style={styles.detailIcon} />
          <Text style={styles.detailText}>CID: {item.cid}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={Colors.textMuted} style={styles.detailIcon} />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} style={styles.detailIcon} />
          <Text style={styles.detailText}>Last Visit: {item.lastVisit}</Text>
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButtonPrimary}>
          <Text style={styles.actionButtonTextPrimary}>View Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSecondary}>
          <Text style={styles.actionButtonTextSecondary}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="person-add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Name, CID, or Phone"
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPatients}
        keyExtractor={item => item.id}
        renderItem={renderPatientCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No patients found</Text>
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.primaryDark,
  },
  headerInfo: {
    flex: 1,
  },
  patientName: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  patientInfo: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  optionsButton: {
    padding: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  detailsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: Spacing.sm,
    width: 20,
  },
  detailText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  actionButtonTextPrimary: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.primaryDark,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonTextSecondary: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
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
