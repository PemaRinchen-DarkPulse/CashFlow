import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { DateField } from '@/src/components/DateField';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useFinance } from '@/src/store/FinanceContext';
import { chartPalette, colors, font, radius, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';
import { addDays, addMonths, daysUntil, formatDate, startOfDay } from '@/src/utils/date';
import { pickGoalImage } from '@/src/utils/goalImage';
import type { GoalImageUpload } from '@/src/api/goalsApi';
import { formatCurrency, sanitizeAmountInput } from '@/src/utils/format';

/** Where the target date starts before the user moves it. */
const DEFAULT_HORIZON_MONTHS = 6;

/** How far ahead a target date can be set. */
const MAX_HORIZON_YEARS = 10;

/** Mean length of a month — good enough to turn a span of days into months. */
const DAYS_PER_MONTH = 30.44;

/**
 * What a goal shows when no picture is chosen. There is no icon picker any
 * more — a photo of the actual thing is the point — but `Goal.icon` is still
 * what the card falls back to, so every goal carries this one marker rather
 * than a choice nobody was asked to make.
 */
const FALLBACK_ICON: IconName = 'flag';

export default function AddGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, addGoal } = useFinance();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [initial, setInitial] = useState('');
  const [image, setImage] = useState<GoalImageUpload | null>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deadline, setDeadline] = useState(() =>
    addMonths(new Date(), DEFAULT_HORIZON_MONTHS)
  );

  /**
   * Chosen for the user rather than asked for. With no icon to tint there is
   * nothing left for a colour picker to change except the progress bar, which
   * is not worth a row of swatches — but taking turns through the palette still
   * keeps one goal card visually distinct from the next.
   */
  const color = chartPalette[state.goals.length % chartPalette.length];

  /** A goal has to be for something ahead of you, so today is already too late. */
  const earliestDeadline = useMemo(() => addDays(startOfDay(new Date()), 1), []);
  const latestDeadline = useMemo(() => {
    const date = startOfDay(new Date());
    date.setFullYear(date.getFullYear() + MAX_HORIZON_YEARS);
    return date;
  }, []);

  const choosePhoto = async () => {
    const result = await pickGoalImage();
    if (result.ok) {
      // Held as the picked file, not copied anywhere: it is uploaded with the
      // goal when this form is saved, and the server keeps it from there.
      setImage(result.image);
      setPhotoNote(null);
      return;
    }
    if (result.reason === 'cancelled') return;
    setPhotoNote(
      result.reason === 'denied'
        ? 'CashFlow needs access to your photos to use one here.'
        : 'That picture could not be used. Try another one.'
    );
  };

  const removePhoto = () => {
    setImage(null);
    setPhotoNote(null);
  };

  const parsedTarget = Number(target);
  const parsedInitial = initial ? Number(initial) : 0;
  const valid =
    name.trim().length > 0 &&
    Number.isFinite(parsedTarget) &&
    parsedTarget > 0 &&
    Number.isFinite(parsedInitial) &&
    parsedInitial >= 0 &&
    parsedInitial <= parsedTarget;

  /**
   * The span the user actually picked, in months, so "x a month" stays true
   * whatever date they chose. Floored at a single day: a deadline of tomorrow
   * is a real choice, and dividing by zero months is not.
   */
  const monthsToDeadline =
    Math.max(daysUntil(deadline.toISOString()), 1) / DAYS_PER_MONTH;
  const monthlyNeeded = valid ? (parsedTarget - parsedInitial) / monthsToDeadline : 0;

  /**
   * How the pace reads back. A monthly rate is the useful framing over a span
   * of months, but the date is free now, and dividing a target by a fortnight
   * gives a per-month figure nobody will ever pay — so a short deadline states
   * what is left to find instead of inventing a rate for it.
   */
  const currency = state.profile.currency;
  const paceLabel =
    monthsToDeadline < 1
      ? `${formatCurrency(parsedTarget - parsedInitial, currency, 0)} to find by ${formatDate(deadline)}`
      : `${formatCurrency(monthlyNeeded, currency, 0)} a month to hit ${formatCurrency(parsedTarget, currency, 0)} by ${formatDate(deadline)}`;

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/goals', params: { tab: 'goals' } });
  };

  /**
   * The goal and its picture go to the server together, so the screen stays
   * open until that lands. Closing first would leave a failed save with nowhere
   * to report it, and the user believing a goal exists that does not.
   */
  const save = async () => {
    if (!valid || saving) return;

    setSaving(true);
    setSaveError(null);

    const res = await addGoal(
      {
        name: name.trim(),
        target: parsedTarget,
        saved: parsedInitial,
        deadline: deadline.toISOString(),
        icon: FALLBACK_ICON,
        color,
      },
      image
    );

    setSaving(false);
    if (res.ok) return close();
    setSaveError(res.message);
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeader title="New goal" subtitle="Give your saving a purpose" onBack={close} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
          <Card style={styles.preview}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <CategoryIcon icon={FALLBACK_ICON} color={color} size={56} />
            )}
            <View style={styles.previewText}>
              <AppText variant="h2" numberOfLines={1}>
                {name.trim() || 'Your goal'}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {valid
                  ? paceLabel
                  : `Target date ${formatDate(deadline)}`}
              </AppText>
            </View>
          </Card>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              Photo
            </AppText>
            {image ? (
              /*
                Once there is a picture it becomes the zone: seeing the actual
                photo at the size it will be remembered at is the whole point,
                so it fills the frame with the two things left to do beneath it.
              */
              <View style={styles.uploadFilled}>
                <Image source={{ uri: image.uri }} style={styles.uploadPreview} contentFit="cover" />
                <View style={styles.uploadActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change photo"
                    onPress={choosePhoto}
                    style={({ pressed }) => [styles.uploadAction, pressed && { opacity: 0.6 }]}>
                    <Ionicons name="swap-horizontal" size={14} color={colors.text} />
                    <AppText variant="label">Change</AppText>
                  </Pressable>
                  <View style={styles.uploadActionDivider} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                    onPress={removePhoto}
                    style={({ pressed }) => [styles.uploadAction, pressed && { opacity: 0.6 }]}>
                    <Ionicons name="trash-outline" size={14} color={colors.expense} />
                    <AppText variant="label" color={colors.expense}>
                      Remove
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ) : (
              /*
                A drop zone without the drop: there is nothing to drag on a
                phone, so the whole panel is the target and the wording asks for
                the tap that actually exists.
              */
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose a photo for this goal"
                onPress={choosePhoto}
                style={({ pressed }) => [styles.dropzone, pressed && styles.dropzonePressed]}>
                <View style={styles.dropzoneIcon}>
                  <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
                </View>
                <AppText variant="bodyMedium" center>
                  Add a photo of your goal
                </AppText>
                {/* Styled as a button but not one: the panel around it already
                    takes the tap, and two nested targets would only compete. */}
                <View style={styles.dropzoneButton}>
                  <AppText variant="label" color="#04140A">
                    Choose Photo
                  </AppText>
                </View>
                <AppText variant="caption" color={colors.textMuted} center>
                  JPG, PNG or HEIC · cropped square
                </AppText>
              </Pressable>
            )}
            {photoNote ? (
              <AppText variant="caption" color={colors.warning} style={styles.photoNote}>
                {photoNote}
              </AppText>
            ) : null}
          </View>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              What are you saving for?
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Emergency fund, new bike, …"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountField}>
              <AppText variant="label" color={colors.textMuted} style={styles.label}>
                Target amount
              </AppText>
              <TextInput
                value={target}
                onChangeText={(text) => setTarget(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.amountField}>
              <AppText variant="label" color={colors.textMuted} style={styles.label}>
                Already saved
              </AppText>
              <TextInput
                value={initial}
                onChangeText={(text) => setInitial(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              Target date
            </AppText>
            {/*
              The same calendar drawer the transaction and debt screens use,
              pointed forwards instead of back — any date the user wants rather
              than the four spans the pills used to allow.
            */}
            <DateField
              value={deadline}
              onChange={setDeadline}
              minimumDate={earliestDeadline}
              maximumDate={latestDeadline}
              accessibilityLabel="Target date for this goal"
            />
          </View>

          <Button
            label={saving ? 'Saving…' : 'Create goal'}
            icon="flag"
            onPress={save}
            loading={saving}
            disabled={!valid || saving}
          />
          {initial && parsedInitial > parsedTarget ? (
            <AppText variant="caption" color={colors.expense} center>
              The amount already saved cannot exceed the target.
            </AppText>
          ) : null}
          {saveError ? (
            <AppText variant="caption" color={colors.expense} center>
              {saveError}
            </AppText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  previewText: {
    flex: 1,
    gap: 3,
  },
  label: {
    marginBottom: spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 15,
  },
  amountRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  amountField: {
    flex: 1,
  },
  previewImage: {
    // Matches CategoryIcon at size 56, which rounds to radius.md above 44.
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  dropzone: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    // The dashed edge is what reads as "drop something here" at a glance.
    // Android draws a dashed border with a corner radius as solid, so this is
    // the one platform difference left standing: the panel is still clearly a
    // panel there, just with a solid outline.
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  dropzonePressed: {
    borderColor: colors.primaryEdge,
    backgroundColor: colors.surfaceHigh,
  },
  dropzoneIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneButton: {
    height: 38,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadFilled: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    // Clips the picture to the panel's corners.
    overflow: 'hidden',
  },
  uploadPreview: {
    width: '100%',
    // Tall enough to judge the crop, short enough to leave the form scrollable.
    height: 172,
    backgroundColor: colors.card,
  },
  uploadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  uploadAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
  },
  uploadActionDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border,
  },
  photoNote: {
    marginTop: spacing.sm,
  },
});
