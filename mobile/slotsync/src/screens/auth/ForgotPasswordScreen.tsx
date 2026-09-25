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
  Animated,
  Easing,
  KeyboardAvoidingView,
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
  ShieldCheck,
  RotateCcw,
  KeyRound,
  User as UserIcon,
  Check,
} from '../../components/LucideIcons';
import { colors, radii } from '../../theme/colors';
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from '../../services/api';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import OtpInput from '../../components/OtpInput';
import { useToast } from '../../context/ToastContext';

interface Props {
  onBackToLogin: () => void;
  onPasswordResetSuccess: (email: string) => void;
}

export default function ForgotPasswordScreen({
  onBackToLogin,
  onPasswordResetSuccess,
}: Props) {
  const { showSuccess, showError, showWarning } = useToast();

  // Step state: 1 = Identifier, 2 = OTP, 3 = New Password, 4 = Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Identifier
  const [identifier, setIdentifier] = useState('');
  const [identifierTouched, setIdentifierTouched] = useState(false);

  // Step 2: Account info from backend
  const [accountEmail, setAccountEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountRole, setAccountRole] = useState<'CREATOR' | 'CLIENT' | string>('');

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (currentStep === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStep, countdown]);

  // Validations
  const isIdentifierValid = identifier.trim().length >= 3;
  const isNewPasswordValid = newPassword.length >= 8;
  const isConfirmPasswordValid =
    confirmPassword.length >= 8 && confirmPassword === newPassword;

  // ── Step 1: Send OTP ──
  const handleSendOtp = async () => {
    setIdentifierTouched(true);
    if (!isIdentifierValid) {
      showWarning('Please enter a valid email or phone number.', 'Input Required');
      return;
    }

    setLoading(true);
    try {
      const res = await sendForgotPasswordOtp(identifier.trim());
      setAccountEmail(res.email || identifier.trim());
      setMaskedEmail(res.masked_email || res.email || identifier.trim());
      setAccountName(res.full_name || 'SlotSync User');
      setAccountRole(res.role || 'CLIENT');
      setCountdown(30);
      setCanResend(false);
      setOtpCode('');
      setOtpError(null);
      setCurrentStep(2);
      showSuccess(res.message || 'Verification code sent to your email.');
    } catch (err: any) {
      showError(
        err.message || 'No account found with this email or phone number.',
        'Account Not Found'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Resend OTP ──
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    try {
      const res = await sendForgotPasswordOtp(accountEmail || identifier.trim());
      setCountdown(30);
      setCanResend(false);
      setOtpCode('');
      setOtpError(null);
      showSuccess(res.message || 'A new verification code has been sent.');
    } catch (err: any) {
      showError(err.message || 'Failed to resend code.', 'Resend Failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) return;
    setLoading(true);
    setOtpError(null);

    try {
      const res = await verifyForgotPasswordOtp(accountEmail, codeToVerify);
      if (res?.verified && res?.reset_token) {
        setResetToken(res.reset_token);
        setCurrentStep(3);
        showSuccess('Verification code confirmed! Set your new password.');
      } else {
        setOtpError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async () => {
    setNewPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!isNewPasswordValid) {
      showWarning('Password must be at least 8 characters long.', 'Password Too Short');
      return;
    }

    if (newPassword !== confirmPassword) {
      showWarning('Passwords do not match. Please verify.', 'Mismatch');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(accountEmail, resetToken, newPassword);
      setCurrentStep(4);
      showSuccess(res.message || 'Password updated successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to reset password. Please try again.', 'Reset Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.outerWrapper}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        {/* Top Header Navigation */}
        <View style={styles.topNavigation}>
          {currentStep < 4 ? (
            <TouchableOpacity
              style={styles.backButtonCircle}
              onPress={() => {
                if (currentStep === 1) {
                  onBackToLogin();
                } else if (currentStep === 2) {
                  setCurrentStep(1);
                } else if (currentStep === 3) {
                  setCurrentStep(2);
                }
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={20} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 42 }} />
          )}

          {/* Stepper Dots */}
          <View style={styles.stepperDotsRow}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={[
                  styles.stepDot,
                  currentStep === step && styles.stepDotActive,
                  currentStep > step && styles.stepDotCompleted,
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Ambient Glow */}
          <Animated.View
            style={[
              styles.animatedGlow,
              {
                transform: [
                  { translateX: glowTranslateX },
                  { scale: glowScale },
                ],
              },
            ]}
          />

          {/* Logo & Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoContainer}>
              <SlotSyncLogo size={62} />
            </View>
            <Text style={styles.brandTitle}>SLOTSYNC</Text>
            <Text style={styles.brandSubtitle}>SECURITY & RECOVERY</Text>
          </View>

          {/* ════════════ STEP 1: IDENTIFIER (EMAIL / PHONE) ════════════ */}
          {currentStep === 1 && (
            <View style={styles.formContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.headerIconDot} />
                <Text style={styles.sectionHeaderTitle}>FIND YOUR ACCOUNT</Text>
              </View>

              <Text style={styles.stepInstructions}>
                Enter the email address or phone number associated with your SlotSync account. We'll send a secure 6-digit verification code.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email or Phone Number</Text>
                <View
                  style={[
                    styles.inputWithIcon,
                    identifierTouched &&
                      !isIdentifierValid &&
                      styles.inputInvalidBorder,
                    identifierTouched &&
                      isIdentifierValid &&
                      styles.inputValidBorder,
                  ]}
                >
                  <View style={styles.iconHolder}>
                    <Mail size={19} color={colors.primary} strokeWidth={2} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="name@example.com or +1 (555)..."
                    placeholderTextColor={colors.textDim}
                    value={identifier}
                    onChangeText={(val) => {
                      setIdentifier(val);
                      if (!identifierTouched) setIdentifierTouched(true);
                    }}
                    onBlur={() => setIdentifierTouched(true)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {identifierTouched && identifier.length > 0 && (
                    <View style={styles.validationIconHolder}>
                      {isIdentifierValid ? (
                        <CheckCircle2
                          size={18}
                          color={colors.primary}
                          strokeWidth={2.2}
                        />
                      ) : (
                        <AlertCircle
                          size={18}
                          color="#ef4444"
                          strokeWidth={2.2}
                        />
                      )}
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  loading && styles.buttonDisabled,
                ]}
                activeOpacity={0.88}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>
                      Send Verification Code
                    </Text>
                    <ArrowRight size={18} color="#ffffff" strokeWidth={2.2} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelLinkButton}
                onPress={onBackToLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelLinkText}>Return to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ════════════ STEP 2: OTP VERIFICATION & PROFILE CONFIRMATION ════════════ */}
          {currentStep === 2 && (
            <View style={styles.formContainer}>
              <View style={styles.sectionHeaderRow}>
                <ShieldCheck size={19} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.sectionHeaderTitle}>
                  ACCOUNT VERIFICATION
                </Text>
              </View>

              {/* Account Match Preview Card */}
              <View style={styles.accountCard}>
                <View style={styles.accountAvatar}>
                  <UserIcon size={20} color={colors.primary} strokeWidth={2.2} />
                </View>
                <View style={styles.accountDetails}>
                  <View style={styles.accountNameRow}>
                    <Text style={styles.accountFullName}>{accountName}</Text>
                    <View
                      style={[
                        styles.roleBadge,
                        accountRole === 'CREATOR'
                          ? styles.creatorRoleBadge
                          : styles.clientRoleBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          accountRole === 'CREATOR'
                            ? styles.creatorRoleText
                            : styles.clientRoleText,
                        ]}
                      >
                        {accountRole === 'CREATOR' ? 'Creator Account' : 'Client Account'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.accountMaskedEmail}>{maskedEmail}</Text>
                </View>
              </View>

              <Text style={styles.otpHelperText}>
                We sent a 6-digit security code to your registered email. Enter it below to proceed:
              </Text>

              {/* Dedicated 6-Cell Otp Input */}
              <View style={styles.inputGroup}>
                <OtpInput
                  code={otpCode}
                  onChangeCode={(val) => {
                    setOtpCode(val);
                    if (otpError) setOtpError(null);
                  }}
                  onComplete={handleVerifyOtp}
                  isInvalid={!!otpError}
                />

                {otpError && (
                  <Text style={styles.inlineOtpErrorText}>{otpError}</Text>
                )}
              </View>

              {/* Resend Action */}
              <View style={styles.resendRow}>
                {canResend ? (
                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleResendOtp}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <RotateCcw size={14} color={colors.primary} />
                    <Text style={styles.resendBtnText}>
                      Resend Verification Code
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendTimerText}>
                    Resend code in{' '}
                    <Text style={styles.countdownBold}>{countdown}s</Text>
                  </Text>
                )}
              </View>

              {loading && (
                <View style={styles.loadingIndicatorWrapper}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={styles.verifyingText}>Verifying code...</Text>
                </View>
              )}
            </View>
          )}

          {/* ════════════ STEP 3: CREATE NEW PASSWORD ════════════ */}
          {currentStep === 3 && (
            <View style={styles.formContainer}>
              <View style={styles.sectionHeaderRow}>
                <KeyRound size={19} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.sectionHeaderTitle}>
                  CREATE NEW PASSWORD
                </Text>
              </View>

              <Text style={styles.stepInstructions}>
                Choose a strong password with at least 8 characters for your {accountName} profile.
              </Text>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View
                  style={[
                    styles.inputWithIcon,
                    newPasswordTouched &&
                      !isNewPasswordValid &&
                      styles.inputInvalidBorder,
                    newPasswordTouched &&
                      isNewPasswordValid &&
                      styles.inputValidBorder,
                  ]}
                >
                  <View style={styles.iconHolder}>
                    <Lock size={19} color={colors.primary} strokeWidth={2} />
                  </View>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="••••••••••••"
                    placeholderTextColor={colors.textDim}
                    value={newPassword}
                    onChangeText={(val) => {
                      setNewPassword(val);
                      if (!newPasswordTouched) setNewPasswordTouched(true);
                    }}
                    onBlur={() => setNewPasswordTouched(true)}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggleBtn}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showNewPassword ? (
                      <Eye size={20} color={colors.primary} strokeWidth={2} />
                    ) : (
                      <EyeOff size={20} color="#94a3b8" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
                {newPasswordTouched && !isNewPasswordValid && (
                  <Text style={styles.helperErrorText}>
                    Password must be at least 8 characters ({newPassword.length}/8)
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View
                  style={[
                    styles.inputWithIcon,
                    confirmPasswordTouched &&
                      !isConfirmPasswordValid &&
                      styles.inputInvalidBorder,
                    confirmPasswordTouched &&
                      isConfirmPasswordValid &&
                      styles.inputValidBorder,
                  ]}
                >
                  <View style={styles.iconHolder}>
                    <Lock size={19} color={colors.primary} strokeWidth={2} />
                  </View>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="••••••••••••"
                    placeholderTextColor={colors.textDim}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (!confirmPasswordTouched) setConfirmPasswordTouched(true);
                    }}
                    onBlur={() => setConfirmPasswordTouched(true)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggleBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} color={colors.primary} strokeWidth={2} />
                    ) : (
                      <EyeOff size={20} color="#94a3b8" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
                {confirmPasswordTouched && !isConfirmPasswordValid && (
                  <Text style={styles.helperErrorText}>
                    Passwords do not match
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  loading && styles.buttonDisabled,
                ]}
                activeOpacity={0.88}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>
                      Update & Save Password
                    </Text>
                    <Check size={18} color="#ffffff" strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ════════════ STEP 4: SUCCESS CONFIRMATION ════════════ */}
          {currentStep === 4 && (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={54} color={colors.primary} strokeWidth={2.4} />
              </View>

              <Text style={styles.successTitle}>Password Updated!</Text>
              <Text style={styles.successSubtitle}>
                Your password for <Text style={styles.boldText}>{accountEmail}</Text> has been successfully reset. You can now sign in with your new credentials.
              </Text>

              <TouchableOpacity
                style={styles.primaryActionButton}
                activeOpacity={0.88}
                onPress={() => onPasswordResetSuccess(accountEmail)}
              >
                <Text style={styles.actionButtonText}>Sign In Now</Text>
                <ArrowRight size={18} color="#ffffff" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 160 }} />
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 100,
  },
  topNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  stepperDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  stepDotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: '#818cf8',
  },
  animatedGlow: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    opacity: 0.8,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e1b4b',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: 2,
    marginTop: 3,
  },
  formContainer: {
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
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
    letterSpacing: 1.2,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  stepInstructions: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputValidBorder: {
    borderColor: '#10b981',
  },
  inputInvalidBorder: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  iconHolder: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  validationIconHolder: {
    marginLeft: 6,
  },
  eyeToggleBtn: {
    padding: 6,
  },
  helperErrorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  primaryActionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: radii.lg,
    marginTop: 10,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelLinkButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  accountFullName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  creatorRoleBadge: {
    backgroundColor: '#e0e7ff',
  },
  creatorRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338ca',
  },
  clientRoleBadge: {
    backgroundColor: '#f1f5f9',
  },
  clientRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  accountMaskedEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  otpHelperText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 18,
  },
  inlineOtpErrorText: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  resendTimerText: {
    fontSize: 13,
    color: '#64748b',
  },
  countdownBold: {
    fontWeight: '700',
    color: colors.primary,
  },
  loadingIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 8,
  },
  verifyingText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  successContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  boldText: {
    fontWeight: '700',
    color: '#1e293b',
  },
});
