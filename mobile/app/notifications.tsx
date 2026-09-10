import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { withAlpha } from '@/src/components/CategoryIcon';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { EmptyState } from '@/src/components/EmptyState';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, radius, spacing } from '@/src/theme';
import { formatTransactionDate } from '@/src/utils/date';

const TONE_COLOR = {
  positive: colors.primary,
  warning: colors.warning,
  neutral: colors.info,
} as const;

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { state, markNotificationsRead, clearNotifications } = useFinance();
  const { notifications } = state;
  const [clearing, setClearing] = useState(false);

  // Opening the screen is the read receipt.
  useEffect(() => {
    markNotificationsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top + spacing.md }}>
        <ScreenHeader
          title="Notifications"
          subtitle={`${notifications.length} update${notifications.length === 1 ? '' : 's'}`}
          right={
            notifications.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setClearing(true)}
                hitSlop={8}
                style={({ pressed }) => [styles.clear, pressed && { opacity: 0.6 }]}>
                <AppText variant="label" color={colors.textSecondary}>
                  Clear
                </AppText>
              </Pressable>
            ) : undefined
          }
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        {notifications.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="You're all caught up"
            body="Budget warnings, goal milestones and income alerts will show up here."
          />
        ) : (
          notifications.map((notification, index) => {
            const tone = TONE_COLOR[notification.tone];
            return (
              <View key={notification.id}>
                <Card style={styles.card}>
                  <View style={[styles.icon, { backgroundColor: withAlpha(tone, 0.16) }]}>
                    <Ionicons name={notification.icon} size={18} color={tone} />
                  </View>
                  <View style={styles.text}>
                    <AppText variant="h3">{notification.title}</AppText>
                    <AppText variant="caption" color={colors.textSecondary} style={styles.body}>
                      {notification.body}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {formatTransactionDate(notification.date)}
                    </AppText>
                  </View>
                </Card>
              </View>
            );
          })
        )}
      </ScrollView>

      <ConfirmDialog
        visible={clearing}
        title="Clear all updates?"
        message={`All ${notifications.length} notification${notifications.length === 1 ? '' : 's'} will be removed from this list.`}
        confirmLabel="Yes, clear them"
        cancelLabel="Keep them"
        onConfirm={() => {
          clearNotifications();
          setClearing(false);
        }}
        onCancel={() => setClearing(false)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  clear: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 3,
  },
  body: {
    lineHeight: 17,
  },
});
