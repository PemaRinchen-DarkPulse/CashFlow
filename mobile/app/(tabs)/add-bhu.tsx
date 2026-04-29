import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { FirstAidKit, MapPin, Phone, EnvelopeSimple, CheckCircle } from 'phosphor-react-native';
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { BHU, createBHU, getBHUs } from '../../services/bhus';

const initialForm = {
  name: '',
  addressLine: '',
  dzongkhag: '',
  gewog: '',
  telephone: '',
  email: '',
};

export default function AddBHUScreen() {
  const { token } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [bhus, setBHUs] = useState<BHU[]>([]);
  const [bhusLoading, setBHUsLoading] = useState(true);
  const [bhusError, setBHUsError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBHUs = useCallback(async () => {
    if (!token) {
      setBHUsLoading(false);
      return;
    }

    setBHUsLoading(true);
    setBHUsError('');

    try {
      const response = await getBHUs(token);
      setBHUs(response.bhus);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load BHUs';
      setBHUsError(message);
    } finally {
      setBHUsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBHUs();
  }, [loadBHUs]);

  const updateField = <Field extends keyof typeof initialForm>(
    field: Field,
    value: (typeof initialForm)[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setFocusedField(null);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name.trim(),
      addressLine: form.addressLine.trim(),
      dzongkhag: form.dzongkhag.trim(),
      gewog: form.gewog.trim(),
      telephone: form.telephone.trim(),
      email: form.email.trim().toLowerCase(),
      status: 'Active' as const,
    };

    if (
      !payload.name ||
      !payload.addressLine ||
      !payload.dzongkhag ||
      !payload.gewog ||
      !payload.telephone ||
      !payload.email
    ) {
      setError('Please fill in every BHU detail.');
      return;
    }

    if (!token) {
      setError('Please sign in again before adding a BHU.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createBHU(payload, token);
      resetForm();
      await loadBHUs();
      Alert.alert('BHU added', 'The BHU has been saved to the database.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add BHU';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <FirstAidKit size={24} color={Colors.primary} weight="fill" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Add BHU</Text>
              <Text style={styles.subtitle}>Register a basic health unit</Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View
              style={[styles.inputWrap, focusedField === 'telephone' && styles.inputWrapFocused]}
            >
              <Phone
                size={20}
                color={focusedField === 'telephone' ? Colors.primary : Colors.textMuted}
                weight="bold"
              />
              <TextInput
                style={styles.input}
                placeholder="Telephone"
                placeholderTextColor={Colors.textMuted}
                value={form.telephone}
                onChangeText={(value) => updateField('telephone', value)}
                keyboardType="phone-pad"
                onFocus={() => setFocusedField('telephone')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
              <EnvelopeSimple
                size={20}
                color={focusedField === 'email' ? Colors.primary : Colors.textMuted}
                weight="bold"
              />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textMuted}
                value={form.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={[styles.inputWrap, focusedField === 'name' && styles.inputWrapFocused]}>
              <FirstAidKit
                size={20}
                color={focusedField === 'name' ? Colors.primary : Colors.textMuted}
                weight="bold"
              />
              <TextInput
                style={styles.input}
                placeholder="BHU name"
                placeholderTextColor={Colors.textMuted}
                value={form.name}
                onChangeText={(value) => updateField('name', value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View
              style={[
                styles.inputWrap,
                focusedField === 'addressLine' && styles.inputWrapFocused,
              ]}
            >
              <MapPin
                size={20}
                color={focusedField === 'addressLine' ? Colors.primary : Colors.textMuted}
                weight="bold"
              />
              <TextInput
                style={styles.input}
                placeholder="Address line"
                placeholderTextColor={Colors.textMuted}
                value={form.addressLine}
                onChangeText={(value) => updateField('addressLine', value)}
                onFocus={() => setFocusedField('addressLine')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.row}>
              <View
                style={[
                  styles.inputWrap,
                  styles.rowInput,
                  focusedField === 'dzongkhag' && styles.inputWrapFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Dzongkhag"
                  placeholderTextColor={Colors.textMuted}
                  value={form.dzongkhag}
                  onChangeText={(value) => updateField('dzongkhag', value)}
                  onFocus={() => setFocusedField('dzongkhag')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View
                style={[
                  styles.inputWrap,
                  styles.rowInput,
                  focusedField === 'gewog' && styles.inputWrapFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Gewog"
                  placeholderTextColor={Colors.textMuted}
                  value={form.gewog}
                  onChangeText={(value) => updateField('gewog', value)}
                  onFocus={() => setFocusedField('gewog')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <CheckCircle size={20} color={Colors.white} weight="bold" />
                <Text style={styles.submitText}>Add BHU</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bhusSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>BHUs</Text>
              <Text style={styles.countText}>{bhus.length}</Text>
            </View>

            {bhusLoading ? (
              <View style={styles.bhuList}>
                {[0, 1, 2].map((item) => (
                  <View key={item} style={styles.skeletonCard}>
                    <View style={styles.skeletonIcon} />
                    <View style={styles.skeletonContent}>
                      <View style={styles.skeletonLineLarge} />
                      <View style={styles.skeletonLineMedium} />
                      <View style={styles.skeletonLineSmall} />
                    </View>
                  </View>
                ))}
              </View>
            ) : bhusError ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Could not load BHUs</Text>
                <Text style={styles.emptyText}>{bhusError}</Text>
                <TouchableOpacity style={styles.retryButton} activeOpacity={0.8} onPress={loadBHUs}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : bhus.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No BHUs yet</Text>
                <Text style={styles.emptyText}>BHUs you add will appear here.</Text>
              </View>
            ) : (
              <View style={styles.bhuList}>
                {bhus.map((bhu) => (
                  <View key={bhu.id} style={styles.bhuCard}>
                    <View style={styles.bhuIcon}>
                      <FirstAidKit size={20} color={Colors.primary} weight="fill" />
                    </View>
                    <View style={styles.bhuInfo}>
                      <Text style={styles.bhuName}>{bhu.name}</Text>
                      <Text style={styles.bhuMeta}>
                        {bhu.gewog}, {bhu.dzongkhag}
                      </Text>
                      <Text style={styles.bhuMeta}>{bhu.telephone}</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusText}>{bhu.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    padding: Spacing.xxl,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputWrap: {
    minHeight: 54,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  rowInput: {
    flex: 1,
  },
  errorText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  submitButton: {
    minHeight: 56,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
  bhusSection: {
    marginTop: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  countText: {
    minWidth: 30,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.primary,
  },
  bhuList: {
    gap: Spacing.md,
  },
  bhuCard: {
    minHeight: 78,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bhuIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bhuInfo: {
    flex: 1,
    gap: 2,
  },
  bhuName: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  bhuMeta: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusPill: {
    borderRadius: Radius.full,
    backgroundColor: Colors.success + '16',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: Colors.success,
  },
  skeletonCard: {
    minHeight: 78,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  skeletonIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
  },
  skeletonContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  skeletonLineLarge: {
    width: '72%',
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  skeletonLineMedium: {
    width: '52%',
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  skeletonLineSmall: {
    width: '38%',
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
  },
  emptyState: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  retryText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.primary,
  },
});
