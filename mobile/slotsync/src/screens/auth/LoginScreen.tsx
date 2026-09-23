import React, { useState, useRef } from 'react';
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
  PanResponder
} from 'react-native';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft 
} from '../../components/LucideIcons';
import { colors, radii } from '../../theme/colors';
import { loginUser } from '../../services/api';
import SlotSyncLogo from '../../components/SlotSyncLogo';

interface Props {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

// Email format regular expression
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ onLoginSuccess, onGoToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation Calculations
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const isEmailInvalid = emailTouched && email.length > 0 && !isEmailValid;
  const isPasswordInvalid = passwordTouched && password.length > 0 && !isPasswordValid;

  // Swipe back gesture handler (PanResponder)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Detect horizontal swipe from left to right (back gesture)
        const isHorizontalSwipe = 
          gestureState.dx > 25 && 
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return isHorizontalSwipe;
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Trigger go back if dragged far enough or with rightward velocity
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
      setError('Please enter both email address and password.');
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await loginUser(email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        showsVerticalScrollIndicator={false}
      >
        {/* Top Glow Ambient Background Effect */}
        <View style={styles.topGlow} />

        {/* Brand Logo & Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoContainer}>
            <SlotSyncLogo size={70} />
          </View>
          <Text style={styles.brandTitle}>SLOTSYNC</Text>
          <Text style={styles.brandSubtitle}>APPOINTMENT & SLOT ENGINE</Text>

          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeSubtitle}>
              Access your Client or Creator workspace portal
            </Text>
          </View>
        </View>

        {/* Error Alert Banner */}
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color="#dc2626" strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ACCOUNT CREDENTIALS CARD */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.headerIconDot} />
              <Text style={styles.cardHeaderTitle}>ACCOUNT CREDENTIALS</Text>
            </View>
          </View>

          {/* Email Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>

            <View style={[
              styles.inputWithIcon,
              isEmailInvalid && styles.inputInvalidBorder
            ]}>
              <View style={styles.iconHolder}>
                <Mail 
                  size={19} 
                  color={isEmailInvalid ? '#ef4444' : '#64748b'} 
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
                  if (error) setError(null);
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
              isPasswordInvalid && styles.inputInvalidBorder
            ]}>
              <View style={styles.iconHolder}>
                <Lock 
                  size={19} 
                  color={isPasswordInvalid ? '#ef4444' : '#64748b'} 
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
                  if (error) setError(null);
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
              <Text style={styles.submitButtonText}>Sign In</Text>
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
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topNavigation: {
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingHorizontal: 16,
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
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    left: '20%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    transform: [{ scaleX: 1.5 }],
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logoContainer: {
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
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
    marginBottom: 12,
  },
  welcomeBlock: {
    alignItems: 'center',
    paddingHorizontal: 20,
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
  cardSection: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: 0.8,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  valStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  valGreenText: {
    color: '#059669',
  },
  valRedText: {
    color: '#dc2626',
  },
  asterisk: {
    color: '#f43f5e',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },
  inputValidBorder: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
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
    fontSize: 14,
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
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 14,
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
