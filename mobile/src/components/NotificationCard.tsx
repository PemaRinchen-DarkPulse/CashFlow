import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme/theme';

interface NotificationCardProps {
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'prescription' | 'result' | 'general';
  read?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const typeConfig: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  appointment: { icon: 'calendar', color: Colors.primary, bg: Colors.primaryContainer },
  prescription: { icon: 'medical', color: '#7B1FA2', bg: '#F3E5F5' },
  result: { icon: 'document-text', color: Colors.success, bg: Colors.successLight },
  general: { icon: 'notifications', color: Colors.warning, bg: Colors.warningLight },
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  message,
  time,
  type,
  read = false,
  onPress,
  style,
}) => {
  const config = typeConfig[type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !read && styles.unread,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, !read && styles.titleUnread]} numberOfLines={1}>{title}</Text>
          {!read && <View style={styles.dot} />}
        </View>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  unread: {
    backgroundColor: Colors.primaryContainer + '30',
    borderColor: Colors.primaryContainer,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxs,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
  message: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  time: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
  },
});
