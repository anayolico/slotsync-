import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  PanResponder,
  Animated,
  Easing,
  KeyboardAvoidingView
} from 'react-native';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  Check,
  Sparkles
} from '../../components/LucideIcons';
import { colors, radii, shadows } from '../../theme/colors';
import { loginUser } from '../../services/api';
import { getItem, setItem, removeItem, StorageKeys } from '../../services/storage';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import { useToast } from '../../context/ToastContext';

interface Props {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
  onGoToForgotPassword?: () => void;
  initialEmail?: string;
}

// Email format regular expression
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({
  onLoginSuccess,
  onGoToRegister,
  onGoToForgotPassword,
  initialEmail
}: Props) {
  const { showError, showWarning } = useToast();
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailTouched, setEmailTouched] = useState(!!initialEmail);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Load remembered credentials or initial email on mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      if (initialEmail) {
        setEmail(initialEmail);
        setEmailTouched(true);
        return;
      }
      try {
        const savedRemember = await getItem(StorageKeys.REMEMBER_ME);
        const savedEmail = await getItem(StorageKeys.SAVED_EMAIL);
        if (savedRemember === 'true' && savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
          setEmailTouched(true);
        }
      } catch (e) {
        console.warn('Failed to load saved email', e);
      }
    };
    loadSavedCredentials();
  }, [initialEmail]);

  // Dual Ambient Floating Glow Animations for vibrant chromatic atmosphere
  const glowAnim = useRef(new Animated.Value(0)).current;
  const secondaryGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(secondaryGlowAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(secondaryGlowAnim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop1.start();
    loop2.start();
    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [glowAnim, secondaryGlowAnim]);

  const glowTranslateX = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.0, 1.25, 1.0],
  });

  const secondaryGlowTranslateY = secondaryGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -30],
  });

  // Validation Calculations
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const isEmailInvalid = emailTouched && email.length > 0 && !isEmailValid;
  const isPasswordInvalid = passwordTouched && password.length > 0 && !isPasswordValid;

  // Swipe back gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dx > 25 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 60 || (gestureState.dx > 30 && gestureState.vx > 0.4)) {
          onGoToRegister();
        }
      },
    })
  ).current;

  const handleLogin = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!email.trim() || !password) {
      showWarning('Please enter both your email address and password.', 'Missing Credentials');
      return;
    }

    if (!isEmailValid) {
      showWarning('Please enter a valid email address (e.g. name@domain.com).', 'Invalid Email');
      return;
    }

    if (password.length < 8) {
      showWarning('Password must be at least 8 characters long.', 'Short Password');
      return;
    }

    setLoading(true);

    try {
      await loginUser(email.trim(), password);
      if (rememberMe) {
        await setItem(StorageKeys.REMEMBER_ME, 'true');
        await setItem(StorageKeys.SAVED_EMAIL, email.trim());
      } else {
        await removeItem(StorageKeys.REMEMBER_ME);
        await removeItem(StorageKeys.SAVED_EMAIL);
      }
      onLoginSuccess();
    } catch (err: any) {
      showError(err.message || 'Invalid login credentials. Please try again.', 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.outerWrapper} {...panResponder.panHandlers}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />

        {/* Floating Minimalist Back Button */}
        <View style={styles.topNavigation}>
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={onGoToRegister}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={20} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Dual Radiant Ambient Glows (Indigo & Violet) */}
          <Animated.View
            style={[
              styles.animatedGlowPrimary,
              {
                transform: [
                  { translateX: glowTranslateX },
                  { scale: glowScale }
                ]
              }
            ]}
          />
          <Animated.View
            style={[
              styles.animatedGlowSecondary,
              {
                transform: [
                  { translateY: secondaryGlowTranslateY },
                ]
              }
            ]}
          />

          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoContainer}>
              <SlotSyncLogo size={70} />
            </View>
            <Text style={styles.brandTitle}>Welcome back</Text>
            <Text style={styles.brandSubtitle}>Sign in to your client or creator workspace</Text>
          </View>

          {/* Seamless Floating Form (No Boxed Card) */}
          <View style={styles.seamlessForm}>
            {/* Section Tag */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.headerIconDot} />
              <Text style={styles.sectionHeaderTitle}>ACCOUNT CREDENTIALS</Text>
            </View>

            {/* Email Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>

              <View style={[
                styles.glassInputContainer,
                emailFocused && styles.glassInputFocused,
                isEmailInvalid && styles.glassInputInvalid,
                isEmailValid && emailTouched && styles.glassInputValid
              ]}>
                <View style={styles.iconHolder}>
                  <Mail
                    size={19}
                    color={isEmailInvalid ? colors.danger : isEmailValid && emailTouched ? colors.primary : colors.primaryLight}
                    strokeWidth={2}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="name@domain.com"
                  placeholderTextColor={colors.textDim}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (!emailTouched) setEmailTouched(true);
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => {
                    setEmailFocused(false);
                    setEmailTouched(true);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailTouched && email.length > 0 && (
                  <View style={styles.validationIconHolder}>
                    {isEmailValid ? (
                      <CheckCircle2 size={18} color={colors.success} strokeWidth={2.4} />
                    ) : (
                      <AlertCircle size={18} color={colors.danger} strokeWidth={2.4} />
                    )}
                  </View>
                )}
              </View>
              {isEmailInvalid && (
                <Text style={styles.helperErrorText}>
                  Please enter a valid email address
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>

              <View style={[
                styles.glassInputContainer,
                passwordFocused && styles.glassInputFocused,
                isPasswordInvalid && styles.glassInputInvalid,
                isPasswordValid && passwordTouched && styles.glassInputValid
              ]}>
                <View style={styles.iconHolder}>
                  <Lock
                    size={19}
                    color={isPasswordInvalid ? colors.danger : isPasswordValid && passwordTouched ? colors.primary : colors.primaryLight}
                    strokeWidth={2}
                  />
                </View>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textDim}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (!passwordTouched) setPasswordTouched(true);
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    setPasswordFocused(false);
                    setPasswordTouched(true);
                  }}
                  secureTextEntry={!showPassword}
                />
                <View style={styles.rightActionsRow}>
                  {passwordTouched && password.length > 0 && (
                    <View style={styles.validationIconHolder}>
                      {isPasswordValid ? (
                        <CheckCircle2 size={18} color={colors.success} strokeWidth={2.4} />
                      ) : (
                        <AlertCircle size={18} color={colors.danger} strokeWidth={2.4} />
                      )}
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.eyeToggleBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showPassword ? (
                      <Eye size={19} color={colors.primary} strokeWidth={2} />
                    ) : (
                      <EyeOff size={19} color={colors.textDim} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              {isPasswordInvalid && (
                <Text style={styles.helperErrorText}>
                  Password must be at least 8 characters ({password.length}/8)
                </Text>
              )}
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkboxBox, rememberMe && styles.checkboxBoxActive]}>
                  {rememberMe && <Check size={11} color="#ffffff" strokeWidth={3} />}
                </View>
                <Text style={styles.rememberMeLabel}>Remember me</Text>
              </TouchableOpacity>

              {onGoToForgotPassword && (
                <TouchableOpacity
                  onPress={onGoToForgotPassword}
                  activeOpacity={0.7}
                  style={styles.forgotPasswordBtn}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Radiant Gradient Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              activeOpacity={0.88}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have a SlotSync account yet?</Text>
            <TouchableOpacity onPress={onGoToRegister} activeOpacity={0.7} style={styles.registerTouch}>
              <Text style={styles.registerLink}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  topNavigation: {
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingHorizontal: 20,
    paddingBottom: 4,
    zIndex: 20,
  },
  backButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    ...shadows.subtle,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 18,
  },
  animatedGlowPrimary: {
    position: 'absolute',
    top: -70,
    left: '10%',
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(79, 70, 229, 0.16)',
  },
  animatedGlowSecondary: {
    position: 'absolute',
    top: 180,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  logoContainer: {
    marginBottom: 14,
    ...shadows.primaryGlow,
  },
  brandTitle: {
    fontSize: 27,
    fontWeight: '900',
    color: colors.textHeading,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  seamlessForm: {
    gap: 16,
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  headerIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    letterSpacing: -0.1,
  },
  glassInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.9)',
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 52,
    ...shadows.subtle,
  },
  glassInputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    ...shadows.card,
  },
  glassInputValid: {
    borderColor: '#818CF8',
    backgroundColor: '#FFFFFF',
  },
  glassInputInvalid: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
  iconHolder: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationIconHolder: {
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMain,
  },
  eyeToggleBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperErrorText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.danger,
    marginTop: 2,
    marginLeft: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: colors.borderDark,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  rememberMeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  forgotPasswordBtn: {
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  submitButton: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    ...shadows.primaryGlow,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  registerTouch: {
    paddingVertical: 4,
  },
  registerLink: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primary,
  },
});
