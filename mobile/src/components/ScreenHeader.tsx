import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { BackButton, BackButtonSpacer } from '@/src/components/BackButton';
import { colors, spacing } from '@/src/theme';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Slot on the right, typically an icon button. */
  right?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
};

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
  showBack = true,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={styles.root}>
      {showBack ? <BackButton onPress={handleBack} /> : <BackButtonSpacer />}

      <View style={styles.titles}>
        <AppText variant="h3" center numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textMuted} center numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={styles.right}>{right ?? <BackButtonSpacer />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  titles: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  right: {
    alignItems: 'flex-end',
  },
});
