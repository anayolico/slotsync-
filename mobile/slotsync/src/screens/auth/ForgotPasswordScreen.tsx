import React, { useState, useEffect } from 'react';
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
import { colors, radii, shadows } from '../../theme/colors';
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from '../../services/api';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import OtpInput from '../../components/OtpInput';
import { useToast } from '../../context/ToastContext';
import AppBackground from '../../components/AppBackground';

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
  const [identifierFocused, setIdentifierFocused] = useState(false);

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
  const [newPassFocused, setNewPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);



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
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const isNewPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const isConfirmPasswordValid =
    confirmPassword.length > 0 && confirmPassword === newPassword && isNewPasswordValid;

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
      showWarning('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.', 'Weak Password');
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
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />
        <AppBackground variant="indigo" />

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
          showsVerticalScrollIndicator={false}
        >


          {/* Logo & Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoContainer}>
              <SlotSyncLogo size={66} />
            </View>
            <Text style={styles.brandTitle}>Reset Password</Text>
            <Text style={styles.brandSubtitle}>Secure account recovery verification</Text>
          </View>

          {/* ════════════ STEP 1: IDENTIFIER (EMAIL / PHONE) ════════════ */}
          {currentStep === 1 && (
            <View style={styles.seamlessForm}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.headerIconDot} />
                <Text style={styles.sectionHeaderTitle}>FIND YOUR ACCOUNT</Text>
              </View>

              <Text style={styles.stepInstructions}>
                Enter the email address associated with your SlotSync account. We'll send a secure 6-digit verification code.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.glassInputContainer,
                    identifierFocused && styles.glassInputFocused,
                    identifierTouched &&
                      !isIdentifierValid &&
                      styles.glassInputInvalid,
                    identifierTouched &&
                      isIdentifierValid &&
                      styles.glassInputValid,
                  ]}
                >
                  <View style={styles.iconHolder}>
                    <Mail size={19} color={identifierTouched && isIdentifierValid ? colors.primary : colors.primaryLight} strokeWidth={2} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="name@domain.com"
                    placeholderTextColor={colors.textDim}
                    value={identifier}
                    onChangeText={(val) => {
                      setIdentifier(val);
                      if (!identifierTouched) setIdentifierTouched(true);
                    }}
                    onFocus={() => setIdentifierFocused(true)}
                    onBlur={() => {
                      setIdentifierFocused(false);
                      setIdentifierTouched(true);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {identifierTouched && identifier.length > 0 && (
                    <View style={styles.validationIconHolder}>
                      {isIdentifierValid ? (
                        <CheckCircle2
                          size={18}
                          color={colors.success}
                          strokeWidth={2.4}
                        />
                      ) : (
                        <AlertCircle
                          size={18}
                          color={colors.danger}
                          strokeWidth={2.4}
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
            <View style={styles.seamlessForm}>
              <View style={styles.sectionHeaderRow}>
                <ShieldCheck size={19} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.sectionHeaderTitle}>
                  SECURITY VERIFICATION
                </Text>
              </View>

              {/* Account Match Preview Glass Card */}
              <View style={styles.accountGlassBanner}>
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
                        {accountRole === 'CREATOR' ? 'CREATOR' : 'CLIENT'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.accountMaskedEmail}>{maskedEmail}</Text>
                </View>
              </View>

              <Text style={styles.otpHelperText}>
                We sent a 6-digit security code to your registered email. Enter it below:
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
            <View style={styles.seamlessForm}>
              <View style={styles.sectionHeaderRow}>
                <KeyRound size={19} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.sectionHeaderTitle}>
                  CREATE NEW PASSWORD
                </Text>
              </View>

              <Text style={styles.stepInstructions}>
                Choose a strong password with at least 8 characters for your profile.
              </Text>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View
                  style={[
                    styles.glassInputContainer,
                    newPassFocused && styles.glassInputFocused,
                    newPasswordTouched &&
                      !isNewPasswordValid &&
                      styles.glassInputInvalid,
                    newPasswordTouched &&
                      isNewPasswordValid &&
                      styles.glassInputValid,
                  ]}
                >
                  <View style={styles.iconHolder}>
                    <Lock size={19} color={newPasswordTouched && isNewPasswordValid ? colors.primary : colors.primaryLight} strokeWidth={2} />
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
                    onFocus={() => setNewPassFocused(true)}
                    onBlur={() => {
                      setNewPassFocused(false);
                      setNewPasswordTouched(true);
                    }}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggleBtn}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showNewPassword ? (
                      <Eye size={19} color={colors.primary} strokeWidth={2} />
                    ) : (
                      <EyeOff size={19} color={colors.textDim} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Single-Line Password Security Requirements */}
                {(newPassFocused || newPassword.length > 0 || newPasswordTouched) && (
                  <View style={styles.pwdRequirementsRow}>
                    <View style={styles.pwdRequirementItem}>
                      <Check
                        size={12}
                        color={hasMinLength ? colors.success : '#CBD5E1'}
                        strokeWidth={hasMinLength ? 2.8 : 2}
                      />
                      <Text style={[styles.pwdRequirementText, hasMinLength && styles.pwdRequirementTextActive]}>
                        8+ chars
                      </Text>
                    </View>
                    <View style={styles.pwdRequirementItem}>
                      <Check
                        size={12}
                        color={hasUpper ? colors.success : '#CBD5E1'}
                        strokeWidth={hasUpper ? 2.8 : 2}
                      />
                      <Text style={[styles.pwdRequirementText, hasUpper && styles.pwdRequirementTextActive]}>
                        Upper
                      </Text>
                    </View>
                    <View style={styles.pwdRequirementItem}>
                      <Check
                        size={12}
                        color={hasLower ? colors.success : '#CBD5E1'}
                        strokeWidth={hasLower ? 2.8 : 2}
                      />
                      <Text style={[styles.pwdRequirementText, hasLower && styles.pwdRequirementTextActive]}>
                        Lower
                      </Text>
                    </View>
                    <View style={styles.pwdRequirementItem}>
                      <Check
                        size={12}
                        color={hasNumber ? colors.success : '#CBD5E1'}
                        strokeWidth={hasNumber ? 2.8 : 2}
                      />
                      <Text style={[styles.pwdRequirementText, hasNumber && styles.pwdRequirementTextActive]}>
                        Number
                      </Text>
                    </View>
                    <View style={styles.pwdRequirementItem}>
                      <Check
                        size={12}
                        color={hasSpecial ? colors.success : '#CBD5E1'}
                        strokeWidth={hasSpecial ? 2.8 : 2}
                      />
                      <Text style={[styles.pwdRequirementText, hasSpecial && styles.pwdRequirementTextActive]}>
                        Symbol
                      </Text>
                    </View>
                  </View>
                )}

                {newPasswordTouched && !isNewPasswordValid && (
                  <Text style={styles.helperErrorText}>
                    Password must meet all requirements above
                  </Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View
                  style={[
                    styles.glassInputContainer,
                    confirmPassFocused && styles.glassInputFocused,
                    confirmPasswordTouched &&
                      !isConfirmPasswordValid &&
                      styles.glassInputInvalid,
                    confirmPasswordTouched &&
                      isConfirmPasswordValid &&
                      styles.glassInputValid,
                  ]}
                >
                  <View style={styles.iconHolder}>
                    <Lock size={19} color={confirmPasswordTouched && isConfirmPasswordValid ? colors.primary : colors.primaryLight} strokeWidth={2} />
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
                    onFocus={() => setConfirmPassFocused(true)}
                    onBlur={() => {
                      setConfirmPassFocused(false);
                      setConfirmPasswordTouched(true);
                    }}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggleBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {showConfirmPassword ? (
                      <Eye size={19} color={colors.primary} strokeWidth={2} />
                    ) : (
                      <EyeOff size={19} color={colors.textDim} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
                {confirmPasswordTouched && !isConfirmPasswordValid && (
                  <Text style={styles.helperErrorText}>
                    {confirmPassword.length === 0
                      ? 'Please confirm your password'
                      : !isNewPasswordValid
                      ? 'Ensure new password meets all security rules first'
                      : 'Passwords do not match'}
                  </Text>
                )}
                {confirmPasswordTouched && isConfirmPasswordValid && (
                  <Text style={styles.helperSuccessText}>✓ Passwords match</Text>
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
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ════════════ STEP 4: SUCCESS CONFIRMATION ════════════ */}
          {currentStep === 4 && (
            <View style={styles.seamlessForm}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={48} color={colors.success} strokeWidth={2.4} />
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
                <ArrowRight size={18} color="#ffffff" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          )}
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 18,
  },
  topNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 4,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
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
    backgroundColor: 'rgba(203, 213, 225, 0.8)',
  },
  stepDotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: colors.primaryLight,
  },
  animatedGlowPrimary: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
  },
  animatedGlowSecondary: {
    position: 'absolute',
    top: 200,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  logoContainer: {
    marginBottom: 12,
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
  },
  seamlessForm: {
    gap: 16,
    marginTop: 6,
  },
  sectionHeaderRow: {
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
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.primary,
  },
  stepInstructions: {
    fontSize: 13.5,
    color: colors.textMuted,
    lineHeight: 19,
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
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.textMain,
    fontWeight: '500',
  },
  validationIconHolder: {
    marginLeft: 6,
  },
  eyeToggleBtn: {
    padding: 6,
  },
  helperErrorText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.danger,
    marginTop: 2,
    marginLeft: 2,
  },
  helperSuccessText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.success,
    marginTop: 3,
    marginLeft: 2,
  },
  pwdRequirementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 5,
    marginTop: 5,
  },
  pwdRequirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pwdRequirementText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  pwdRequirementTextActive: {
    color: colors.success,
    fontWeight: '700',
  },
  primaryActionButton: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    ...shadows.primaryGlow,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cancelLinkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  accountGlassBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(238, 242, 255, 0.85)',
    borderRadius: radii.lg,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    ...shadows.subtle,
  },
  accountAvatar: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  accountDetails: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  accountFullName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  creatorRoleBadge: {
    backgroundColor: colors.accentPurpleWash,
  },
  clientRoleBadge: {
    backgroundColor: '#ffffff',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  creatorRoleText: {
    color: colors.accentViolet,
  },
  clientRoleText: {
    color: colors.primary,
  },
  accountMaskedEmail: {
    fontSize: 12.5,
    color: colors.textDim,
  },
  otpHelperText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  inlineOtpErrorText: {
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  resendBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primary,
  },
  resendTimerText: {
    fontSize: 13,
    color: colors.textDim,
  },
  countdownBold: {
    fontWeight: '800',
    color: colors.primary,
  },
  loadingIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyingText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textMain,
  },
});
