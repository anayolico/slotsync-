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
  Sparkles,
  Plus,
  X,
  Calendar
} from '../../components/LucideIcons';
import { colors, radii } from '../../theme/colors';
import { registerUser, loginUser, sendEmailOtp, verifyEmailOtp } from '../../services/api';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import OtpInput from '../../components/OtpInput';
import DatePickerModal from '../../components/DatePickerModal';
import { useToast } from '../../context/ToastContext';

interface Props {
  onRegisterSuccess: () => void;
  onBackToChoice: () => void;
}

const DEFAULT_CATEGORIES = [
  'General',
  'Healthcare',
  'Legal Advisory',
  'Consulting',
  'Tech & Software',
  'Fitness & Health',
  'Grooming',
  'Tutoring'
];

const QUICK_PREFERENCE_PROMPTS = [
  'Morning Slots (9am - 12pm)',
  'Afternoon Slots (1pm - 5pm)',
  'Virtual / Video Call Only',
  'In-Person Consultation',
  'Urgent / Priority'
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export default function RegisterClientScreen({ onRegisterSuccess, onBackToChoice }: Props) {
  const { showError, showWarning, showSuccess } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Credentials & Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);

  // Touched states for validation
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [dobTouched, setDobTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  // Step 2 State: Booking Preferences
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['General']);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Step 3 State: OTP Verification
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Floating Ambient Glow Animation
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentStep === 3) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 250);
    }
  }, [currentStep]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3800,
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
  const isFullNameValid = fullName.trim().length >= 2;
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPhoneValid = phone.trim().length >= 7 && PHONE_REGEX.test(phone.trim());
  const isDobValid = /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim());
  const isPasswordValid = password.length >= 8;

  const isFullNameInvalid = fullNameTouched && !isFullNameValid;
  const isEmailInvalid = emailTouched && !isEmailValid;
  const isPhoneInvalid = phoneTouched && !isPhoneValid;
  const isDobInvalid = dobTouched && !isDobValid;
  const isPasswordInvalid = passwordTouched && !isPasswordValid;

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
        return gestureState.dx > 25 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 60 || (gestureState.dx > 30 && gestureState.vx > 0.4)) {
          handleBackNavigation();
        }
      },
    })
  ).current;

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (!customTags.includes(trimmed) && !DEFAULT_CATEGORIES.includes(trimmed)) {
      setCustomTags([...customTags, trimmed]);
    }
    if (!selectedCategories.includes(trimmed)) {
      setSelectedCategories([...selectedCategories, trimmed]);
    }
    setNewTagInput('');
  };

  const handleRemoveCustomTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
    setSelectedCategories(selectedCategories.filter(c => c !== tag));
  };

  const handleTogglePrompt = (prompt: string) => {
    if (clientNotes.includes(prompt)) {
      const updated = clientNotes.replace(prompt, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
      setClientNotes(updated);
    } else {
      const updated = clientNotes.trim() ? `${clientNotes.trim()}, ${prompt}` : prompt;
      if (updated.length <= 300) {
        setClientNotes(updated);
      }
    }
  };

  const handleStep1ToStep2 = () => {
    setFullNameTouched(true);
    setEmailTouched(true);
    setPhoneTouched(true);
    setDobTouched(true);
    setPasswordTouched(true);

    if (!isFullNameValid || !isEmailValid || !isPhoneValid || (!isGoogleVerified && !isPasswordValid)) {
      showWarning('Please enter all required fields including a valid phone number.', 'Incomplete Details');
      return;
    }

    if (!isDobValid) {
      showWarning('Please enter a valid Date of Birth (YYYY-MM-DD, e.g. 1995-08-24).', 'Date of Birth Required');
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Submit = async () => {
    if (isGoogleVerified) {
      setLoading(true);
      try {
        await registerUser({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          avatar_url: avatarUrl || undefined,
          phone_number: phone.trim() || undefined,
          role: 'CLIENT',
          verification_token: 'google_verified',
        });
        await loginUser(email.trim(), password);
        onRegisterSuccess();
      } catch (err: any) {
        showError(err.message || 'Google account registration failed.', 'Registration Failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    try {
      await sendEmailOtp(email.trim());
      setCountdown(60);
      setCanResend(false);
      setOtpError(null);
      setOtpCode('');
      setCurrentStep(3);
    } catch (err: any) {
      showError(err.message || 'Failed to send verification code. Please check your email.', 'Verification Error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtpError(null);
    setLoading(true);

    try {
      await sendEmailOtp(email.trim());
      setCountdown(60);
      setCanResend(false);
      setOtpCode('');
      showSuccess('A fresh 6-digit verification code has been sent to your email.', 'Code Sent');
    } catch (err: any) {
      showError(err.message || 'Failed to resend code.', 'Resend Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (customCode?: string) => {
    const codeToVerify = (customCode || otpCode).trim();
    if (codeToVerify.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    setOtpError(null);
    setLoading(true);

    try {
      const otpRes = await verifyEmailOtp(email.trim(), codeToVerify);
      const token = otpRes?.verification_token || 'verified';

      await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        avatar_url: avatarUrl || undefined,
        phone_number: phone.trim() || undefined,
        gender,
        date_of_birth: dateOfBirth.trim() || undefined,
        marital_status: maritalStatus,
        role: 'CLIENT',
        verification_token: token,
      });

      await loginUser(email.trim(), password);
      onRegisterSuccess();
    } catch (err: any) {
      setOtpError(err.message || 'Invalid verification code. Please check and try again.');
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
            onPress={handleBackNavigation} 
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={20} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
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

        {/* STEP 1: ACCOUNT CREDENTIALS */}
        {currentStep === 1 && (
          <View style={styles.formContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.headerIconDot} />
              <Text style={styles.sectionHeaderTitle}>ACCOUNT CREDENTIALS</Text>
            </View>

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>

              <View style={[
                styles.inputWithIcon,
                isFullNameInvalid && styles.inputInvalidBorder,
                isFullNameValid && fullNameTouched && styles.inputValidBorder
              ]}>
                <View style={styles.iconHolder}>
                  <User 
                    size={19} 
                    color={isFullNameInvalid ? '#ef4444' : isFullNameValid && fullNameTouched ? colors.primary : '#64748b'} 
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
                  }}
                  onBlur={() => setFullNameTouched(true)}
                  autoCapitalize="words"
                />
                {fullNameTouched && (
                  <View style={styles.validationIconHolder}>
                    {isFullNameValid ? (
                      <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
                    ) : (
                      <AlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
                    )}
                  </View>
                )}
              </View>
              {isFullNameInvalid && (
                <Text style={styles.helperErrorText}>
                  Please enter your full legal name
                </Text>
              )}
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
                  placeholder="client@example.com"
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
                {emailTouched && (
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
                  Please enter a valid email address (e.g. client@example.com)
                </Text>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>

              <View style={[
                styles.inputWithIcon,
                isPhoneInvalid && styles.inputInvalidBorder,
                isPhoneValid && phoneTouched && styles.inputValidBorder
              ]}>
                <View style={styles.iconHolder}>
                  <Phone 
                    size={19} 
                    color={isPhoneInvalid ? '#ef4444' : isPhoneValid && phoneTouched ? colors.primary : '#64748b'} 
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
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  keyboardType="phone-pad"
                />
                {phoneTouched && (
                  <View style={styles.validationIconHolder}>
                    {isPhoneValid ? (
                      <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
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

            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Gender</Text>
                <Text style={styles.subHint}>Select your gender</Text>
              </View>
              <View style={styles.pillSelectorRow}>
                {(['Male', 'Female'] as const).map((g) => {
                  const isSelected = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.pillOption, isSelected && styles.pillOptionActive]}
                      onPress={() => setGender(g)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pillOptionText, isSelected && styles.pillOptionTextActive]}>{g}</Text>
                      {isSelected && <Check size={16} color="#ffffff" strokeWidth={2.5} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Date of Birth Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <Text style={styles.subHint}>YYYY-MM-DD</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowDobPicker(true)}
                style={[
                  styles.inputWithIcon,
                  isDobInvalid && styles.inputInvalidBorder,
                  isDobValid && dobTouched && styles.inputValidBorder
                ]}
              >
                <View style={styles.iconHolder}>
                  <Calendar
                    size={19}
                    color={isDobInvalid ? '#ef4444' : isDobValid && dobTouched ? colors.primary : '#64748b'}
                    strokeWidth={2}
                  />
                </View>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="YYYY-MM-DD (e.g. 1995-08-24)"
                  placeholderTextColor={colors.textDim}
                  value={dateOfBirth}
                  editable={false}
                  pointerEvents="none"
                />
                <TouchableOpacity 
                  style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#e0e7ff', borderRadius: 8, marginRight: 8 }}
                  onPress={() => setShowDobPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>Choose</Text>
                </TouchableOpacity>
                {dobTouched && (
                  <View style={styles.validationIconHolder}>
                    {isDobValid ? (
                      <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
                    ) : (
                      <AlertCircle size={18} color="#ef4444" strokeWidth={2.2} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
              {isDobInvalid && (
                <Text style={styles.helperErrorText}>
                  Please enter a valid Date of Birth (YYYY-MM-DD, e.g. 1995-08-24)
                </Text>
              )}
            </View>

            {/* DatePickerModal Component */}
            <DatePickerModal
              visible={showDobPicker}
              value={dateOfBirth}
              onSelect={(d) => {
                setDateOfBirth(d);
                setDobTouched(true);
              }}
              onClose={() => setShowDobPicker(false)}
              title="Select Date of Birth"
            />

            {/* Marital Status Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Marital Status</Text>
                <Text style={styles.subHint}>Select status</Text>
              </View>
              <View style={styles.pillSelectorRow}>
                {(['Single', 'Married', 'Divorced', 'Widowed'] as const).map((ms) => {
                  const isSelected = maritalStatus === ms;
                  return (
                    <TouchableOpacity
                      key={ms}
                      style={[styles.pillOption, isSelected && styles.pillOptionActive]}
                      onPress={() => setMaritalStatus(ms)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pillOptionText, isSelected && styles.pillOptionTextActive]}>{ms}</Text>
                      {isSelected && <Check size={14} color="#ffffff" strokeWidth={2.5} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
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
                  {passwordTouched && (
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
          </View>
        )}

        {/* STEP 2: CLIENT PREFERENCES */}
        {currentStep === 2 && (
          <View style={styles.formContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.headerIconDot} />
              <Text style={styles.sectionHeaderTitle}>BOOKING PREFERENCES</Text>
            </View>

            {/* Primary Service Interests Chips */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Primary Service Interest</Text>
                <Text style={styles.subHint}>Tap to select</Text>
              </View>

              {/* Tag Badges Horizontal Scrolling Line */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScrollWrapper}
                contentContainerStyle={styles.horizontalChipsScroll}
              >
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isActive = selectedCategories.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.modernTag,
                        isActive && styles.modernTagActive
                      ]}
                      activeOpacity={0.75}
                      onPress={() => toggleCategory(cat)}
                    >
                      {isActive && <Check size={13} color="#ffffff" strokeWidth={2.8} style={{ marginRight: 6 }} />}
                      <Text style={[
                        styles.modernTagText,
                        isActive && styles.modernTagTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Custom User-Added Tags */}
                {customTags.map((tag) => {
                  const isActive = selectedCategories.includes(tag);
                  return (
                    <View
                      key={tag}
                      style={[
                        styles.modernTag,
                        isActive && styles.modernTagActive,
                        styles.customTagWrapper
                      ]}
                    >
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => toggleCategory(tag)}
                        activeOpacity={0.75}
                      >
                        {isActive && <Check size={13} color="#ffffff" strokeWidth={2.8} style={{ marginRight: 6 }} />}
                        <Text style={[
                          styles.modernTagText,
                          isActive && styles.modernTagTextActive
                        ]}>
                          {tag}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleRemoveCustomTag(tag)}
                        style={styles.removeTagBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={13} color={isActive ? '#ffffff' : '#64748b'} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Type Your Own Custom Tag Input Row */}
              <View style={styles.addTagInputRow}>
                <TextInput
                  style={styles.addTagInput}
                  placeholder="Type custom interest (e.g. Dermatology)..."
                  placeholderTextColor={colors.textDim}
                  value={newTagInput}
                  onChangeText={setNewTagInput}
                  onSubmitEditing={handleAddCustomTag}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.addTagButton, !newTagInput.trim() && styles.addTagButtonDisabled]}
                  onPress={handleAddCustomTag}
                  disabled={!newTagInput.trim()}
                  activeOpacity={0.8}
                >
                  <Plus size={14} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.addTagButtonText}>Add Tag</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Booking Notes with Quick Prompts */}
            <View style={[styles.inputGroup, { marginTop: 4 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Booking Preferences / Special Notes</Text>
                <Text style={styles.charCountText}>{clientNotes.length}/300</Text>
              </View>

              {/* Quick Prompt Pills in One Horizontal Scrolling Line */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScrollWrapper}
                contentContainerStyle={styles.horizontalPromptsScroll}
              >
                {QUICK_PREFERENCE_PROMPTS.map((prompt) => {
                  const isIncluded = clientNotes.includes(prompt);
                  return (
                    <TouchableOpacity
                      key={prompt}
                      style={[
                        styles.promptChip,
                        isIncluded && styles.promptChipActive
                      ]}
                      onPress={() => handleTogglePrompt(prompt)}
                      activeOpacity={0.75}
                    >
                      <Text style={[
                        styles.promptChipText,
                        isIncluded && styles.promptChipTextActive
                      ]}>
                        {isIncluded ? '✓ ' : '+ '}{prompt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textAreaInput}
                  placeholder="Specify any preferred appointment timings, consultation topics, or special requests..."
                  placeholderTextColor={colors.textDim}
                  value={clientNotes}
                  onChangeText={setClientNotes}
                  maxLength={300}
                  multiline
                  numberOfLines={4}
                />
                {clientNotes.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearNotesBtn} 
                    onPress={() => setClientNotes('')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearNotesText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: OTP EMAIL VERIFICATION (Auto-verify + All Red Boxes on Error, No Top Error Alert) */}
        {currentStep === 3 && (
          <View style={styles.formContainer}>
            <View style={styles.sectionHeaderRow}>
              <ShieldCheck size={18} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.sectionHeaderTitle}>EMAIL VERIFICATION</Text>
            </View>

            <View style={styles.otpInfoBox}>
              <Text style={styles.otpInfoText}>
                We sent a 6-digit verification code to:
              </Text>
              <Text style={styles.otpTargetEmail}>{email}</Text>
            </View>

            {/* Dedicated 6-Cell OTP Component */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Enter 6-Digit Code</Text>
              
              <OtpInput
                code={otpCode}
                onChangeCode={(val) => {
                  setOtpCode(val);
                  if (otpError) setOtpError(null);
                }}
                onComplete={(completedCode) => {
                  handleVerifyAndRegister(completedCode);
                }}
                isInvalid={!!otpError}
              />

              {/* Inline Error Text (Below Boxes) */}
              {otpError && (
                <Text style={styles.inlineOtpErrorText}>
                  {otpError}
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

        <View style={{ height: 130 }} />
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
              onPress={() => {
                setOtpError(null);
                setCurrentStep(2);
              }}
            >
              <ChevronLeft size={16} color="#475569" strokeWidth={2} />
              <Text style={styles.secondaryBtnText}>Edit Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionButton, { flex: 1.4 }, loading && styles.buttonDisabled]}
              activeOpacity={0.88}
              onPress={() => handleVerifyAndRegister()}
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
    paddingBottom: 160,
    gap: 16,
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
  headingSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logoBadgeContainer: {
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  stepProgressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    gap: 8,
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepTabActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef2ff',
  },
  stepBadgeNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeNumActive: {
    backgroundColor: colors.primary,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  stepBadgeTextActive: {
    color: '#ffffff',
  },
  stepTabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepTabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  stepLineSeparator: {
    width: 14,
    height: 1.5,
    backgroundColor: '#cbd5e1',
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  subHint: {
    fontSize: 11.5,
    color: colors.textDim,
    fontWeight: '500',
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
  horizontalScrollWrapper: {
    marginHorizontal: -24,
    marginVertical: 4,
  },
  horizontalChipsScroll: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  modernTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8.5,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  modernTagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  modernTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  modernTagTextActive: {
    color: '#ffffff',
  },
  customTagWrapper: {
    paddingRight: 8,
    gap: 6,
  },
  removeTagBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  addTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  addTagInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.textMain,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
    paddingHorizontal: 15,
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addTagButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  addTagButtonText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  horizontalPromptsScroll: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  promptChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  promptChipActive: {
    backgroundColor: '#eef2ff',
    borderColor: colors.primary,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  promptChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  charCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  textAreaContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    padding: 12,
    marginTop: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  textAreaInput: {
    fontSize: 13.5,
    color: colors.textMain,
    minHeight: 80,
    textAlignVertical: 'top',
    paddingBottom: 16,
  },
  clearNotesBtn: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  clearNotesText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ef4444',
  },
  otpInfoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginBottom: 4,
  },
  otpInfoText: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
  otpTargetEmail: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  inlineOtpErrorText: {
    color: '#dc2626',
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  resendTimerText: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
  countdownBold: {
    fontWeight: '800',
    color: colors.primary,
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  primaryActionButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBtn: {
    flex: 0.6,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  secondaryBtnText: {
    color: '#475569',
    fontSize: 14.5,
    fontWeight: '700',
  },
  progressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 11.5,
    color: colors.textDim,
    fontWeight: '600',
  },
  dotSeparator: {
    color: colors.textDim,
    fontSize: 10,
  },
  bottomHomeBar: {
    width: 120,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 2,
    opacity: 0.6,
  },
  pillSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  pillOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  pillOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  pillOptionTextActive: {
    color: '#ffffff',
  },
});
