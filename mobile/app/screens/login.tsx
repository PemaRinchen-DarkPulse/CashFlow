import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Eye, EyeSlash, Phone, Lock, ArrowRight, CheckSquare, Square } from 'phosphor-react-native';
import { login } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function Logo() {
  return (
    <View style={styles.logoContainer}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryMid]}
        style={styles.logoGradient}
      >
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
            fill="#FFF"
          />
        </Svg>
      </LinearGradient>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { saveAuth } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setError('Please enter your phone/CID and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(phone.trim(), password);
      await saveAuth(res.token, res.user as unknown as Record<string, unknown>);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F0F4FF', Colors.background, '#FFFFFF']}
      locations={[0, 0.4, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
            {/* Decorative circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            {/* Header */}
            <View style={styles.header}>
              <Logo />
              <Text style={styles.brand}>AiMediCare</Text>
              <Text style={styles.tagline}>Your health companion</Text>
            </View>

            {/* Welcome text */}
            <View style={styles.welcomeBlock}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSub}>
                Sign in with your CID or phone number to continue
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Phone / CID field */}
              <View
                style={[
                  styles.inputWrap,
                  focusedField === 'phone' && styles.inputWrapFocused,
                ]}
              >
                <Phone
                  size={20}
                  color={focusedField === 'phone' ? Colors.primary : Colors.textMuted}
                  weight="bold"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone number or CID"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="number-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password field */}
              <View
                style={[
                  styles.inputWrap,
                  focusedField === 'password' && styles.inputWrapFocused,
                ]}
              >
                <Lock
                  size={20}
                  color={focusedField === 'password' ? Colors.primary : Colors.textMuted}
                  weight="bold"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeSlash size={20} color={Colors.textMuted} weight="bold" />
                  ) : (
                    <Eye size={20} color={Colors.textMuted} weight="bold" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Remember me & Forgot password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberBtn}
                  activeOpacity={0.7}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe ? (
                    <CheckSquare size={20} color={Colors.primary} weight="fill" />
                  ) : (
                    <Square size={20} color={Colors.textMuted} weight="bold" />
                  )}
                  <Text style={[styles.rememberText, rememberMe && { color: Colors.textPrimary }]}>
                    Remember me
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Error message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Sign in button */}
              <TouchableOpacity activeOpacity={0.85} onPress={handleLogin} disabled={loading}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.signInBtn, loading && { opacity: 0.7 }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.signInText}>Sign In</Text>
                      <ArrowRight size={20} color="#FFF" weight="bold" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social / alternative sign-in */}
            <View style={styles.altRow}>
              <TouchableOpacity style={styles.altBtn} activeOpacity={0.7}>
                <Image
                  source={require('../../assets/images/NDI.png')}
                  style={styles.ndiIcon}
                  resizeMode="contain"
                />
                <Text style={styles.altBtnText}>Continue with Bhutan NDI</Text>
              </TouchableOpacity>
            </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },

  // Decorative
  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(26, 86, 219, 0.06)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 80,
    left: -70,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(26, 86, 219, 0.04)',
  },

  // Header / Logo
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 36,
  },
  logoContainer: {
    marginBottom: 14,
  },
  logoGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontFamily: Fonts.extraBold,
    fontSize: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Welcome
  welcomeBlock: {
    marginBottom: 28,
  },
  welcomeTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  welcomeSub: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },

  // Form
  form: {
    gap: 14,
    marginBottom: 28,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  inputWrapFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFBFF',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  forgotText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  signInText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: '#FFF',
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 8,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 14,
  },

  // Alt login
  altRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  altBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  altBtnIcon: {
    fontSize: 18,
  },
  ndiIcon: {
    width: 22,
    height: 22,
  },
  altBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },
  legalText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
