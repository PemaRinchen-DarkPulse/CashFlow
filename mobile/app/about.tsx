import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { withAlpha } from '@/src/components/CategoryIcon';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SectionHeader } from '@/src/components/SectionHeader';
import { colors, radius, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

const MAKER = 'Pema Rinchen';

const NOTES: { icon: IconName; title: string; body: string; accent: string }[] = [
  {
    icon: 'wallet-outline',
    title: 'See where it went',
    body: 'Income, spending, budgets, savings goals, and money with friends — in one place.',
    accent: colors.primary,
  },
  {
    icon: 'flag-outline',
    title: 'Built for ngultrum first',
    body: 'Amounts default to Nu. You can switch the symbol, but this started as a Bhutanese money app.',
    accent: colors.info,
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'No card numbers',
    body: 'CashFlow never asks for a bank or card number. Face ID and fingerprint stay on your phone.',
    accent: colors.warning,
  },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top + spacing.md }}>
        <ScreenHeader title="About" subtitle="Who made this, and why" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              contentFit="cover"
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
          <AppText variant="h1" center>
            CashFlow
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center>
            Made by {MAKER}
          </AppText>
        </View>

        <Card style={styles.letter}>
          <AppText variant="body" color={colors.textSecondary} style={styles.letterBody}>
            I built CashFlow so you can answer one question at a glance: where did
            my money go? It is the tracker I wanted for myself — then I shared it
            with friends.
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.letterBody}>
            Your ledger and photos belong to your account. This phone only keeps
            the things that have to live here, like Face ID. If something feels
            off or you want a change, tell me.
          </AppText>
          <AppText variant="label" color={colors.primary}>
            — {MAKER}
          </AppText>
        </Card>

        <View>
          <SectionHeader title="What to know" />
          <View style={styles.notes}>
            {NOTES.map((note) => (
              <Card key={note.title} style={styles.note}>
                <View style={[styles.noteIcon, { backgroundColor: withAlpha(note.accent, 0.16) }]}>
                  <Ionicons name={note.icon} size={18} color={note.accent} />
                </View>
                <View style={styles.noteText}>
                  <AppText variant="h3">{note.title}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {note.body}
                  </AppText>
                </View>
              </Card>
            ))}
          </View>
        </View>

        <AppText variant="caption" color={colors.textMuted} center>
          CashFlow · v1.0.0 · Made by {MAKER}
        </AppText>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  letter: {
    gap: spacing.lg,
  },
  letterBody: {
    lineHeight: 22,
  },
  notes: {
    gap: spacing.md,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
  },
  noteIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    flex: 1,
    gap: 4,
  },
});
