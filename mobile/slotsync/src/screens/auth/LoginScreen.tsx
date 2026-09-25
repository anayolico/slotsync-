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
  Check
} from '../../components/LucideIcons';
import { colors, radii } from '../../theme/colors';
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

  // Floating Ambient Glow Animation
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  const glowTranslateX = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-35, 35],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.0, 1.15, 1.0],
  });

  // Validation Calculations
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const isEmailInvalid = emailTouched && email.length > 0 && !isEmailValid;
  const isPasswordInvalid = passwordTouched && password.length > 0 && !isPasswordValid;

  // Swipe back gesture handler (PanResponder)
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.outerWrapper} {...panResponder.panHandlers}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

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
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
        >
        {/* Animated Ambient Top Glow Effect */}
        <Animated.View 
          style={[
            styles.animatedGlow, 
            { 
              transform: [
                { translateX: glowTranslateX },
                { scale: glowScale }
              ] 
            }
          ]} 
        />

        {/* Brand Logo & Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoContainer}>
            <SlotSyncLogo size={68} />
          </View>
          <Text style={styles.brandTitle}>SLOTSYNC</Text>
          <Text style={styles.brandSubtitle}>APPOINTMENT & SLOT ENGINE</Text>

          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeSubtitle}>
              Access your Client or Creator workspace portal
            </Text>
          </View>
        </View>

        {/* Seamless Form Container (No Boxed Card) */}
        <View style={styles.formContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.headerIconDot} />
            <Text style={styles.sectionHeaderTitle}>ACCOUNT CREDENTIALS</Text>
          </View>

          {/* Email Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>

            <View style={[
              styles.inputWithIcon,
              isEmailInvalid && styles.inputInvalidBorder,
              isEmailValid && emailTouched && styles.inputValidBorder
            ]}>
              <View style={styles.iconHolder}>
                <Mail 
                  size={19} 
                  color={isEmailInvalid ? '#ef4444' : isEmailValid && emailTouched ? colors.primary : '#64748b'} 
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="user@example.com"
                placeholderTextColor={colors.textDim}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (!emailTouched) setEmailTouched(true);
                }}
                onBlur={() => setEmailTouched(true)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailTouched && email.length > 0 && (
                <View style={styles.validationIconHolder}>
                  {isEmailValid ? (
                    <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
                  ) : (
                    <AlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
                  )}
                </View>
              )}
            </View>
            {isEmailInvalid && (
              <Text style={styles.helperErrorText}>
                Please enter a valid email address (e.g., name@example.com)
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>

            <View style={[
              styles.inputWithIcon,
              isPasswordInvalid && styles.inputInvalidBorder,
              isPasswordValid && passwordTouched && styles.inputValidBorder
            ]}>
              <View style={styles.iconHolder}>
                <Lock 
                  size={19} 
                  color={isPasswordInvalid ? '#ef4444' : isPasswordValid && passwordTouched ? colors.primary : '#64748b'} 
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
                onBlur={() => setPasswordTouched(true)}
                secureTextEntry={!showPassword}
              />
              <View style={styles.rightActionsRow}>
                {passwordTouched && password.length > 0 && (
                  <View style={styles.validationIconHolder}>
                    {isPasswordValid ? (
                      <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
                    ) : (
                      <AlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
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
                    <Eye size={20} color={colors.primary} strokeWidth={2} />
                  ) : (
                    <EyeOff size={20} color="#94a3b8" strokeWidth={2} />
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

          {/* Remember Me & Forgot Password Options Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxBox, rememberMe && styles.checkboxBoxActive]}>
                {rememberMe && <Check size={11} color="#ffffff" strokeWidth={3} />}
              </View>
              <Text style={styles.rememberMeLabel}>Remember Me</Text>
            </TouchableOpacity>

            {onGoToForgotPassword && (
              <TouchableOpacity 
                onPress={onGoToForgotPassword} 
                activeOpacity={0.7}
                style={styles.forgotPasswordBtn}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
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
                <ArrowRight size={18} color="#ffffff" strokeWidth={2.2} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have a SlotSync account yet?</Text>
          <TouchableOpacity onPress={onGoToRegister} activeOpacity={0.7}>
            <Text style={styles.registerLink}>Join SlotSync Now</Text>
          </TouchableOpacity>
        </View>

        {/* iOS Home Indicator */}
        <View style={styles.bottomHomeBar} />
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topNavigation: {
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingHorizontal: 20,
    paddingBottom: 4,
    zIndex: 20,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 60,
    gap: 18,
  },
  animatedGlow: {
    position: 'absolute',
    top: -60,
    left: '15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    transform: [{ scaleX: 1.6 }],
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 6,
  },
  logoContainer: {
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 1.8,
    marginTop: 2,
    marginBottom: 10,
  },
  welcomeBlock: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: radii.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formContainer: {
    gap: 16,
    marginTop: 4,
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
    color: '#475569',
    letterSpacing: 0.8,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  inputValidBorder: {
    borderColor: '#818cf8',
    backgroundColor: '#ffffff',
  },
  inputInvalidBorder: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
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
    fontSize: 14.5,
    fontWeight: '500',
    color: colors.textMain,
  },
  eyeToggleBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperErrorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 2,
    marginLeft: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 2,
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
    borderColor: '#94a3b8',
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
    color: '#475569',
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
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  footerText: {
    fontSize: 12.5,
    color: colors.textMuted,
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  bottomHomeBar: {
    width: 120,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 18,
    opacity: 0.6,
  },
});
