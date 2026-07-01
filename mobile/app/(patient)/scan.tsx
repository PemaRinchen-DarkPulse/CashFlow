import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme/theme';

interface ScanActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
}

function ScanAction({ icon, title, description, color, onPress }: ScanActionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        scanStyles.card,
        pressed && scanStyles.pressed,
      ]}
    >
      <View style={[scanStyles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={scanStyles.textContainer}>
        <Text style={scanStyles.title}>{title}</Text>
        <Text style={scanStyles.description}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
    </Pressable>
  );
}

const scanStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});

export default function PatientScanScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scanner Preview Placeholder */}
        <View style={styles.scannerPreview}>
          <View style={styles.scannerFrame}>
            <Ionicons name="qr-code-outline" size={64} color={Colors.primary} />
            <Text style={styles.scannerText}>Point camera at QR code</Text>
          </View>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Scan Actions */}
        <Text style={styles.sectionTitle}>Scan Actions</Text>
        <View style={styles.actionList}>
          <ScanAction
            icon="log-in-outline"
            title="Check-in at Hospital"
            description="Scan the QR code at reception"
            color={Colors.primary}
            onPress={() => {}}
          />
          <ScanAction
            icon="medical-outline"
            title="Scan Prescription"
            description="Scan your prescription barcode"
            color={Colors.success}
            onPress={() => {}}
          />
          <ScanAction
            icon="swap-horizontal-outline"
            title="Scan Referral Code"
            description="Scan referral from another facility"
            color="#7B1FA2"
            onPress={() => {}}
          />
          <ScanAction
            icon="person-outline"
            title="View My QR Code"
            description="Show your patient QR code"
            color={Colors.warning}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  scannerPreview: {
    marginHorizontal: Spacing.md,
    height: 200,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  scannerFrame: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  scannerText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: Spacing.md,
    left: Spacing.md,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: Spacing.md,
    right: Spacing.md,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: Spacing.md,
    left: Spacing.md,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: Spacing.md,
    right: Spacing.md,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
});
