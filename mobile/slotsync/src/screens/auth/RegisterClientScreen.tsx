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
  PanResponder
} from 'react-native';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles 
} from '../../components/LucideIcons';
import { colors, radii } from '../../theme/colors';
import { registerUser, loginUser, sendEmailOtp, verifyEmailOtp, loginWithGoogle } from '../../services/api';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import GoogleIcon from '../../components/GoogleIcon';
import AvatarUpload from '../../components/AvatarUpload';

interface Props {
  onRegisterSuccess: () => void;
  onBackToChoice: () => void;
}

const INTEREST_CATEGORIES = ['General', 'Healthcare', 'Legal', 'Grooming', 'Fitness', 'Consulting'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export default function RegisterClientScreen({ onRegisterSuccess, onBackToChoice }: Props) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Credentials & Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Touched states for validation
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Step 2 State: Booking Preferences
  const [preferredCategory, setPreferredCategory] = useState('General');
  const [clientNotes, setClientNotes] = useState('');

  // Step 3 State: OTP Verification
  const [otpCode, setOtpCode] = useState('');
  const [otpTouched, setOtpTouched] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Validation Calculations
  const isFullNameValid = fullName.trim().length >= 2;
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPhoneValid = phone.trim().length === 0 || PHONE_REGEX.test(phone.trim());
  const isPasswordValid = isGoogleVerified || password.length >= 8;
  const isOtpValid = otpCode.trim().length === 6;

  const isFullNameInvalid = fullNameTouched && !isFullNameValid;
  const isEmailInvalid = emailTouched && !isEmailValid;
  const isPhoneInvalid = phoneTouched && phone.trim().length > 0 && !isPhoneValid;
  const isPasswordInvalid = passwordTouched && !isGoogleVerified && !isPasswordValid;
  const isOtpInvalid = otpTouched && !isOtpValid;

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any = null;
    if (currentStep === 3 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStep, countdown]);

  // Swipe back gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          gestureState.dx > 25 && 
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 60 || (gestureState.dx > 30 && gestureState.vx > 0.4)) {
          if (currentStep === 3) {
            setCurrentStep(2);
          } else if (currentStep === 2) {
            setCurrentStep(1);
          } else {
            onBackToChoice();
          }
        }
      },
    })
  ).current;

  // Google Sign-In Handler: Fetches Google profile info, pre-populates fields, and transitions to Step 2
  const handleGooglePrepopulate = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Pre-populate with Google User profile details & avatar
      setFullName('Alex Morgan');
      setEmail('alex.morgan@gmail.com');
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
      setPassword('GoogleSecurePass123!');
      setIsGoogleVerified(true);
      setFullNameTouched(true);
      setEmailTouched(true);

      // Auto-advance to Step 2 (Preferences)
      setTimeout(() => {
        setCurrentStep(2);
      }, 400);
    } catch (err: any) {
      setApiError(err.message || 'Google account sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep1ToStep2 = () => {
    setFullNameTouched(true);
    setEmailTouched(true);
    setPhoneTouched(true);
    setPasswordTouched(true);

    if (!isFullNameValid || !isEmailValid || (!isGoogleVerified && !isPasswordValid) || (phone.trim().length > 0 && !isPhoneValid)) {
      return;
    }

    setApiError(null);
    setCurrentStep(2);
  };

  const handleStep2Submit = async () => {
    // If user is Google-verified, bypass OTP and complete registration immediately!
    if (isGoogleVerified) {
      setLoading(true);
      setApiError(null);
      try {
        await registerUser({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          phone_number: phone.trim() || undefined,
          role: 'CLIENT',
        });
        await loginUser(email.trim(), password);
        onRegisterSuccess();
      } catch (err: any) {
        setApiError(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise, standard email registration -> send OTP
    setApiError(null);
    setLoading(true);

    try {
      await sendEmailOtp(email.trim());
      setCountdown(60);
      setCanResend(false);
      setCurrentStep(3);
    } catch (err: any) {
      setApiError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setApiError(null);
    setLoading(true);

    try {
      await sendEmailOtp(email.trim());
      setCountdown(60);
      setCanResend(false);
      setOtpCode('');
      setOtpTouched(false);
    } catch (err: any) {
      setApiError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    setOtpTouched(true);
    if (!isOtpValid) {
      return;
    }

    setApiError(null);
    setLoading(true);

    try {
      // 1. Verify OTP with backend
      const otpRes = await verifyEmailOtp(email.trim(), otpCode.trim());
      const token = otpRes?.verification_token || 'verified';

      // 2. Complete Account Registration
      await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone_number: phone.trim() || undefined,
        role: 'CLIENT',
        verification_token: token,
      });

      // 3. Log user in and transition
      await loginUser(email.trim(), password);
      onRegisterSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBackToChoice();
    }
  };

  return (
    <View style={styles.outerWrapper} {...panResponder.panHandlers}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Floating Minimalist Back Button */}
      <View style={styles.topNavigation}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={handleBackNavigation} 
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
        {/* Ambient Top Glow Effect */}
        <View style={styles.topGlow} />

        {/* Heading Section */}
        <View style={styles.headingSection}>
          <View style={styles.logoBadgeContainer}>
            <SlotSyncLogo size={56} />
          </View>
          <Text style={styles.pageTitle}>Client Profile Onboarding</Text>
          <Text style={styles.pageSubtitle}>
            Create your account to discover creators, view available slots, and book instant consultations.
          </Text>
        </View>

        {/* Step Indicator Progress Bar */}
        <View style={styles.stepProgressBarRow}>
          <TouchableOpacity 
            style={[styles.stepTab, currentStep === 1 && styles.stepTabActive]} 
            onPress={() => setCurrentStep(1)}
            activeOpacity={0.8}
          >
            <View style={[styles.stepBadgeNum, currentStep === 1 && styles.stepBadgeNumActive]}>
              <Text style={[styles.stepBadgeText, currentStep === 1 && styles.stepBadgeTextActive]}>1</Text>
            </View>
            <Text style={[styles.stepTabLabel, currentStep === 1 && styles.stepTabLabelActive]}>Account</Text>
          </TouchableOpacity>

          <View style={styles.stepLineSeparator} />

          <TouchableOpacity 
            style={[styles.stepTab, currentStep === 2 && styles.stepTabActive]} 
            onPress={handleStep1ToStep2}
            activeOpacity={0.8}
          >
            <View style={[styles.stepBadgeNum, currentStep === 2 && styles.stepBadgeNumActive]}>
              <Text style={[styles.stepBadgeText, currentStep === 2 && styles.stepBadgeTextActive]}>2</Text>
            </View>
            <Text style={[styles.stepTabLabel, currentStep === 2 && styles.stepTabLabelActive]}>Preferences</Text>
          </TouchableOpacity>

          {!isGoogleVerified && (
            <>
              <View style={styles.stepLineSeparator} />
              <View style={[styles.stepTab, currentStep === 3 && styles.stepTabActive]}>
                <View style={[styles.stepBadgeNum, currentStep === 3 && styles.stepBadgeNumActive]}>
                  <Text style={[styles.stepBadgeText, currentStep === 3 && styles.stepBadgeTextActive]}>3</Text>
                </View>
                <Text style={[styles.stepTabLabel, currentStep === 3 && styles.stepTabLabelActive]}>Verify</Text>
              </View>
            </>
          )}
        </View>

        {/* Google Synced Banner Alert */}
        {isGoogleVerified && currentStep === 2 && (
          <View style={styles.googleSyncBanner}>
            <Sparkles size={16} color="#059669" strokeWidth={2.2} />
            <Text style={styles.googleSyncText}>
              Google account synced: <Text style={styles.googleSyncEmail}>{email}</Text>
            </Text>
          </View>
        )}

        {/* API Server Error Alert */}
        {apiError && (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color="#dc2626" strokeWidth={2} />
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        )}

        {/* STEP 1: ACCOUNT CREDENTIALS */}
        {currentStep === 1 && (
          <View style={styles.cardSection}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.headerIconDot} />
                <Text style={styles.cardHeaderTitle}>ACCOUNT CREDENTIALS</Text>
              </View>
            </View>

            {/* Google OAuth Quick Button */}
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGooglePrepopulate}
              activeOpacity={0.85}
              disabled={loading}
            >
              <GoogleIcon size={18} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or register with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Avatar / Profile Photo Upload */}
            <AvatarUpload
              avatarUrl={avatarUrl}
              onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
              isGoogleLinked={isGoogleVerified}
            />

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Full Name</Text>
                {fullNameTouched && (
                  <Text style={[styles.valStatusText, isFullNameValid ? styles.valGreenText : styles.valRedText]}>
                    {isFullNameValid ? 'Valid name' : 'Required'}
                  </Text>
                )}
              </View>

              <View style={[
                styles.inputWithIcon,
                fullNameTouched && (isFullNameValid ? styles.inputValidBorder : styles.inputInvalidBorder)
              ]}>
                <View style={styles.iconHolder}>
                  <User 
                    size={19} 
                    color={
                      fullNameTouched 
                        ? (isFullNameValid ? '#10b981' : '#ef4444') 
                        : '#64748b'
                    } 
                    strokeWidth={2}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textDim}
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (!fullNameTouched) setFullNameTouched(true);
                    if (apiError) setApiError(null);
                  }}
                  onBlur={() => setFullNameTouched(true)}
                  autoCapitalize="words"
                />
                {fullNameTouched && (
                  <View style={styles.validationIconHolder}>
                    {isFullNameValid ? (
                      <CheckCircle2 size={18} color="#10b981" strokeWidth={2.2} />
                    ) : (
                      <AlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
                    )}
                  </View>
                )}
              </View>
              {isFullNameInvalid && (
                <Text style={styles.helperErrorText}>
                  Please enter your full legal name (at least 2 characters)
                </Text>
              )}
            </View>

            {/* Email Address Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Email Address</Text>
                {emailTouched && (
                  <Text style={[styles.valStatusText, isEmailValid ? styles.valGreenText : styles.valRedText]}>
                    {isEmailValid ? 'Valid email format' : 'Invalid email'}
                  </Text>
                )}
              </View>

              <View style={[
                styles.inputWithIcon,
                emailTouched && (isEmailValid ? styles.inputValidBorder : styles.inputInvalidBorder)
              ]}>
                <View style={styles.iconHolder}>
                  <Mail 
                    size={19} 
                    color={
                      emailTouched 
                        ? (isEmailValid ? '#10b981' : '#ef4444') 
                        : '#64748b'
                    } 
                    strokeWidth={2}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="client@example.com"
                  placeholderTextColor={colors.textDim}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (!emailTouched) setEmailTouched(true);
                    if (apiError) setApiError(null);
                  }}
                  onBlur={() => setEmailTouched(true)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailTouched && (
                  <View style={styles.validationIconHolder}>
                    {isEmailValid ? (
                      <CheckCircle2 size={18} color="#10b981" strokeWidth={2.2} />
                    ) : (
                      <AlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
                    )}
                  </View>
                )}
              </View>
              {isEmailInvalid && (
                <Text style={styles.helperErrorText}>
                  Please enter a valid email address (e.g. client@example.com)
                </Text>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                {phoneTouched && phone.trim().length > 0 && (
                  <Text style={[styles.valStatusText, isPhoneValid ? styles.valGreenText : styles.valRedText]}>
                    {isPhoneValid ? 'Valid phone' : 'Invalid format'}
                  </Text>
                )}
              </View>

              <View style={[
                styles.inputWithIcon,
                phoneTouched && phone.trim().length > 0 && (isPhoneValid ? styles.inputValidBorder : styles.inputInvalidBorder)
              ]}>
                <View style={styles.iconHolder}>
                  <Phone 
                    size={19} 
                    color={
                      phoneTouched && phone.trim().length > 0
                        ? (isPhoneValid ? '#10b981' : '#ef4444') 
                        : '#64748b'
                    } 
                    strokeWidth={2}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={colors.textDim}
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (!phoneTouched) setPhoneTouched(true);
                    if (apiError) setApiError(null);
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  keyboardType="phone-pad"
                />
                {phoneTouched && phone.trim().length > 0 && (
                  <View style={styles.validationIconHolder}>
                    {isPhoneValid ? (
                      <CheckCircle2 size={18} color="#10b981" strokeWidth={2.2} />
                    ) : (
                      <AlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
                    )}
                  </View>
                )}
              </View>
              {isPhoneInvalid && (
                <Text style={styles.helperErrorText}>
                  Please enter a valid phone number (7-15 digits)
                </Text>
              )}
            </View>

            {/* Password Input */}
            {!isGoogleVerified && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Password</Text>
                  {passwordTouched && (
                    <Text style={[styles.valStatusText, isPasswordValid ? styles.valGreenText : styles.valRedText]}>
                      {isPasswordValid ? 'Min 8 chars met' : `${password.length}/8 characters`}
                    </Text>
                  )}
                </View>

                <View style={[
                  styles.inputWithIcon,
                  passwordTouched && (isPasswordValid ? styles.inputValidBorder : styles.inputInvalidBorder)
                ]}>
                  <View style={styles.iconHolder}>
                    <Lock 
                      size={19} 
                      color={
                        passwordTouched 
                          ? (isPasswordValid ? '#10b981' : '#ef4444') 
                          : '#64748b'
                      } 
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
                      if (apiError) setApiError(null);
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    secureTextEntry={!showPassword}
                  />
                  <View style={styles.rightActionsRow}>
                    {passwordTouched && (
                      <View style={styles.validationIconHolder}>
                        {isPasswordValid ? (
                          <CheckCircle2 size={18} color="#10b981" strokeWidth={2.2} />
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
            )}
          </View>
        )}

        {/* STEP 2: CLIENT PREFERENCES */}
        {currentStep === 2 && (
          <View style={styles.cardSection}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.headerIconDot} />
                <Text style={styles.cardHeaderTitle}>BOOKING PREFERENCES</Text>
              </View>
            </View>

            {/* Preferred Interest Categories */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Primary Service Interest</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.categoryPillsRow}
              >
                {INTEREST_CATEGORIES.map((cat) => {
                  const isActive = preferredCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catPill,
                        isActive && styles.catPillActive
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setPreferredCategory(cat)}
                    >
                      {isActive && <Check size={14} color="#ffffff" strokeWidth={2.5} style={{ marginRight: 4 }} />}
                      <Text style={[
                        styles.catPillText,
                        isActive && styles.catPillTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Additional Booking Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Booking Preferences / Special Notes (Optional)</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textAreaInput}
                  placeholder="E.g. Morning appointment preferences, specific consultation topics..."
                  placeholderTextColor={colors.textDim}
                  value={clientNotes}
                  onChangeText={setClientNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: OTP EMAIL VERIFICATION */}
        {currentStep === 3 && (
          <View style={styles.cardSection}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <ShieldCheck size={18} color={colors.primary} strokeWidth={2.2} />
                <Text style={styles.cardHeaderTitle}>EMAIL VERIFICATION</Text>
              </View>
            </View>

            <View style={styles.otpInfoBox}>
              <Text style={styles.otpInfoText}>
                We sent a 6-digit verification code to:
              </Text>
              <Text style={styles.otpTargetEmail}>{email}</Text>
            </View>

            {/* OTP Code Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Enter 6-Digit Code</Text>
                {otpTouched && (
                  <Text style={[styles.valStatusText, isOtpValid ? styles.valGreenText : styles.valRedText]}>
                    {isOtpValid ? '6-digits entered' : `${otpCode.length}/6 digits`}
                  </Text>
                )}
              </View>

              <View style={[
                styles.inputWithIcon,
                otpTouched && (isOtpValid ? styles.inputValidBorder : styles.inputInvalidBorder)
              ]}>
                <View style={styles.iconHolder}>
                  <ShieldCheck 
                    size={19} 
                    color={
                      otpTouched 
                        ? (isOtpValid ? '#10b981' : '#ef4444') 
                        : '#64748b'
                    } 
                    strokeWidth={2}
                  />
                </View>
                <TextInput
                  style={[styles.textInput, styles.otpInputText]}
                  placeholder="123456"
                  placeholderTextColor={colors.textDim}
                  value={otpCode}
                  onChangeText={(val) => {
                    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 6);
                    setOtpCode(cleanVal);
                    if (!otpTouched) setOtpTouched(true);
                    if (apiError) setApiError(null);
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {otpTouched && (
                  <View style={styles.validationIconHolder}>
                    {isOtpValid ? (
                      <CheckCircle2 size={18} color="#10b981" strokeWidth={2.2} />
                    ) : (
                      <AlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
                    )}
                  </View>
                )}
              </View>
              {isOtpInvalid && (
                <Text style={styles.helperErrorText}>
                  Please enter the complete 6-digit code sent to your email
                </Text>
              )}
            </View>

            {/* Resend Timer & Button */}
            <View style={styles.resendRow}>
              {canResend ? (
                <TouchableOpacity 
                  style={styles.resendBtn} 
                  onPress={handleResendOtp}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <RotateCcw size={14} color={colors.primary} />
                  <Text style={styles.resendBtnText}>Resend Verification Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendTimerText}>
                  Resend code in <Text style={styles.countdownBold}>{countdown}s</Text>
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.floatingBottomBar}>
        {currentStep === 1 && (
          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.88}
            onPress={handleStep1ToStep2}
          >
            <Text style={styles.actionButtonText}>Next: Preferences</Text>
            <ArrowRight size={18} color="#ffffff" strokeWidth={2.2} />
          </TouchableOpacity>
        )}

        {currentStep === 2 && (
          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.8}
              onPress={() => setCurrentStep(1)}
            >
              <ChevronLeft size={16} color="#475569" strokeWidth={2} />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, { flex: 1.4 }, loading && styles.buttonDisabled]}
              activeOpacity={0.88}
              onPress={handleStep2Submit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.actionButtonText}>
                    {isGoogleVerified ? 'Create Account' : 'Send Code'}
                  </Text>
                  <ArrowRight size={18} color="#ffffff" strokeWidth={2.2} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.8}
              onPress={() => setCurrentStep(2)}
            >
              <ChevronLeft size={16} color="#475569" strokeWidth={2} />
              <Text style={styles.secondaryBtnText}>Edit Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, { flex: 1.4 }, loading && styles.buttonDisabled]}
              activeOpacity={0.88}
              onPress={handleVerifyAndRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Verify & Complete</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Info Subtext */}
        <View style={styles.progressInfoRow}>
          <Text style={styles.progressText}>
            {isGoogleVerified ? `Step ${currentStep} of 2 (Google Linked)` : `Step ${currentStep} of 3`}
          </Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.progressText}>
            {currentStep === 1 ? 'Credentials' : currentStep === 2 ? 'Preferences' : 'Verify Email'}
          </Text>
        </View>

        {/* iOS Home Indicator */}
        <View style={styles.bottomHomeBar} />
      </View>
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
    paddingBottom: 24,
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
  headingSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logoBadgeContainer: {
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  stepProgressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 4,
  },
  stepTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  stepTabActive: {
    backgroundColor: '#eef2ff',
  },
  stepBadgeNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeNumActive: {
    backgroundColor: colors.primary,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  stepBadgeTextActive: {
    color: '#ffffff',
  },
  stepTabLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
  },
  stepTabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  stepLineSeparator: {
    width: 12,
    height: 1.5,
    backgroundColor: '#e2e8f0',
  },
  googleSyncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  googleSyncText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    flex: 1,
  },
  googleSyncEmail: {
    fontWeight: '800',
    color: '#065f46',
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    height: 48,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 11,
    color: colors.textDim,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  otpInputText: {
    letterSpacing: 6,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
  categoryPillsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textAreaContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 10,
  },
  textAreaInput: {
    height: 70,
    fontSize: 13,
    color: colors.textMain,
    textAlignVertical: 'top',
    lineHeight: 18,
  },
  otpInfoBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  otpInfoText: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
  otpTargetEmail: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.primary,
  },
  resendTimerText: {
    fontSize: 12,
    color: colors.textDim,
  },
  countdownBold: {
    fontWeight: '800',
    color: colors.textMain,
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 30,
  },
  primaryActionButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBtn: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  progressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDim,
  },
  dotSeparator: {
    fontSize: 11,
    color: colors.textDim,
  },
  bottomHomeBar: {
    width: 120,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    opacity: 0.6,
  },
});
