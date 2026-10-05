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
  KeyboardAvoidingView,
  Modal
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
  MapPin,
  Sparkles,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Heart
} from '../../components/LucideIcons';
import { colors, radii, shadows } from '../../theme/colors';
import { registerUser, loginUser, sendEmailOtp, verifyEmailOtp } from '../../services/api';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import OtpInput from '../../components/OtpInput';
import DatePickerModal from '../../components/DatePickerModal';
import { useToast } from '../../context/ToastContext';
import AppBackground from '../../components/AppBackground';

interface Props {
  onRegisterSuccess: () => void;
  onBackToChoice: () => void;
}

const CATEGORIES = ['Doctor', 'Lawyer', 'Barber', 'Consultant', 'General', 'Fitness', 'Beauty', 'Tutor'];
const SUGGESTED_TITLES: Record<string, string[]> = {
  Doctor: ['General Practitioner (MD)', 'Specialist Physician', 'Clinical Consultant', 'Dentist / Dental Surgeon', 'Pediatrician'],
  Lawyer: ['Corporate Attorney', 'Legal Counsel & Advisor', 'Litigation Specialist', 'Notary & Property Solicitor'],
  Barber: ['Master Barber & Stylist', 'Grooming Specialist', 'Senior Hair Stylist', 'Celebrity Stylist'],
  Consultant: ['Senior Business Consultant', 'Financial Advisor', 'Strategy & Operations Lead', 'Management Consultant'],
  General: ['Professional Consultant', 'Independent Specialist', 'Creative Director', 'Operations Specialist'],
  Fitness: ['Certified Fitness Coach', 'Personal Trainer & Nutritionist', 'Strength & Conditioning Specialist'],
  Beauty: ['Licensed Esthetician', 'Professional Makeup Artist', 'Skincare Specialist', 'Spa & Wellness Director'],
  Tutor: ['Academic Tutor & Educator', 'Senior Language Instructor', 'STEM Education Specialist', 'Test Prep Specialist']
};
const DEFAULT_TITLE_SUGGESTIONS = [
  'Senior Consultant',
  'Master Practitioner',
  'Director & Specialist',
  'Professional Advisor',
  'Founder & Lead Expert'
];

const CONSULTATION_MODES = [
  { id: 'VIRTUAL', label: 'Virtual (Online)' },
  { id: 'IN_PERSON', label: 'In-Person (Office)' },
  { id: 'BOTH', label: 'Both Virtual / Office' }
];
const SLOT_DURATIONS = [15, 30, 45, 60];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export default function RegisterCreatorScreen({ onRegisterSuccess, onBackToChoice }: Props) {
  const { showError, showWarning, showSuccess } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Credentials
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);


  // Touched states
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [dobTouched, setDobTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  // Marital Status Dropdown
  const [maritalDropdownOpen, setMaritalDropdownOpen] = useState(false);
  const maritalDropdownAnim = useRef(new Animated.Value(0)).current;

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'] as const;

  const openMaritalDropdown = () => {
    setMaritalDropdownOpen(true);
    Animated.spring(maritalDropdownAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 70,
      friction: 10,
    }).start();
  };

  const closeMaritalDropdown = () => {
    Animated.timing(maritalDropdownAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setMaritalDropdownOpen(false));
  };

  const selectMaritalStatus = (value: typeof maritalStatus) => {
    setMaritalStatus(value);
    closeMaritalDropdown();
  };


  // Step 2 State: Service Details & Consultation Setup
  const [category, setCategory] = useState('Doctor');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [title, setTitle] = useState('');
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');
  const [slotDuration, setSlotDuration] = useState(30);
  const [consultationMode, setConsultationMode] = useState('VIRTUAL');
  const [officeAddress, setOfficeAddress] = useState('');
  const [bio, setBio] = useState('');

  // Step 3 State: OTP Verification
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (currentStep === 3) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 250);
    }
  }, [currentStep]);

  // Validation Calculations
  const phoneDigits = phone.replace(/\D/g, '');
  const isFullNameValid = fullName.trim().length >= 2;
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPhoneValid =
    phoneDigits.length === 11 ||
    (phoneDigits.startsWith('234') && (phoneDigits.length === 13 || phoneDigits.length === 14));
  const isDobValid = /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim());

  // Strong Password Criteria:
  // Requires at least 8 characters, uppercase, lowercase, number, and special character
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password && isPasswordValid;

  const isFullNameInvalid = fullNameTouched && !isFullNameValid;
  const isEmailInvalid = emailTouched && !isEmailValid;
  const isPhoneInvalid = phoneTouched && !isPhoneValid;
  const isDobInvalid = dobTouched && !isDobValid;
  const isPasswordInvalid = passwordTouched && !isPasswordValid;
  const isConfirmPasswordInvalid = confirmPasswordTouched && !isConfirmPasswordValid;


  // Custom category handlers
  const handleAddCustomCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed) && !CATEGORIES.includes(trimmed)) {
      setCustomCategories(prev => [...prev, trimmed]);
    }
    setCategory(trimmed);
    setNewCategoryInput('');
  };

  const handleRemoveCustomCategory = (catToRemove: string) => {
    const updated = customCategories.filter(c => c !== catToRemove);
    setCustomCategories(updated);
    if (category === catToRemove) {
      setCategory(CATEGORIES[0]);
    }
  };

  const currentTitleSuggestions = SUGGESTED_TITLES[category] || DEFAULT_TITLE_SUGGESTIONS;

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

  const handleStep1ToStep2 = () => {
    setFullNameTouched(true);
    setEmailTouched(true);
    setPhoneTouched(true);
    setDobTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!isFullNameValid || !isEmailValid || !isPhoneValid || (!isGoogleVerified && !isPasswordValid)) {
      if (!isFullNameValid) {
        showWarning('Please enter your full name.', 'Required Field');
        return;
      }
      if (!isEmailValid) {
        showWarning('Please enter a valid email address.', 'Invalid Email');
        return;
      }
      if (!isPhoneValid) {
        showWarning('Please enter a valid 11-digit phone number (e.g. 08012345678).', 'Invalid Phone Number');
        return;
      }
      if (!isGoogleVerified && !isPasswordValid) {
        showWarning('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.', 'Weak Password');
        return;
      }
      showWarning('Please enter all required fields.', 'Incomplete Details');
      return;
    }

    if (!isDobValid) {
      showWarning('Please enter a valid Date of Birth (YYYY-MM-DD, e.g. 1995-08-24).', 'Date of Birth Required');
      return;
    }

    if (!isGoogleVerified && !isConfirmPasswordValid) {
      showWarning('Passwords do not match. Please re-enter your confirm password.', 'Password Mismatch');
      return;
    }

    setCurrentStep(2);
  };


  const handleStep2Submit = async () => {
    if (!category.trim()) {
      showWarning('Please select or add a professional category.', 'Required Field');
      return;
    }
    if (!title.trim()) {
      showWarning('Please enter or select your professional title.', 'Required Field');
      return;
    }
    if (!hourlyRate.trim() || isNaN(parseFloat(hourlyRate)) || parseFloat(hourlyRate) <= 0) {
      showWarning('Please enter a valid hourly consultation rate (greater than 0).', 'Required Field');
      return;
    }
    if (consultationMode !== 'VIRTUAL' && !officeAddress.trim()) {
      showWarning('Please provide your physical office or clinic address for in-person consultations.', 'Required Field');
      return;
    }
    if (!bio.trim() || bio.trim().length < 10) {
      showWarning('Please write a brief introduction/bio (at least 10 characters) about your services.', 'Required Field');
      return;
    }

    if (isGoogleVerified) {
      setLoading(true);
      try {
        await registerUser({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          avatar_url: avatarUrl || undefined,
          phone_number: phone.trim(),
          role: 'CREATOR',
          category,
          title: title.trim(),
          bio: bio.trim(),
          hourly_rate: parseFloat(hourlyRate) || 0,
          slot_duration_minutes: slotDuration,
          consultation_mode: consultationMode,
          office_address: consultationMode !== 'VIRTUAL' ? officeAddress.trim() : undefined,
          currency: 'NGN',
          verification_token: 'google_verified',
        });
        await loginUser(email.trim(), password);
        onRegisterSuccess();
      } catch (err: any) {
        showError(err.message || 'Failed to create creator profile with Google.', 'Registration Failed');
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
        role: 'CREATOR',
        category,
        title: title.trim() || `${fullName.trim()}'s Service`,
        bio: bio.trim() || 'Welcome to my SlotSync calendar! Select a time slot below to book.',
        hourly_rate: parseFloat(hourlyRate) || 0.0,
        slot_duration_minutes: slotDuration,
        consultation_mode: consultationMode,
        office_address: consultationMode !== 'VIRTUAL' ? officeAddress.trim() : undefined,
        currency: 'NGN',
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
    >
      <View style={styles.outerWrapper} {...panResponder.panHandlers}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />
        <AppBackground variant="violet" />

        {/* Floating Minimalist Back Button */}
        <View style={styles.topNavigation}>
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={handleBackNavigation}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={20} color={colors.accentViolet} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >


          {/* Heading Section */}
          <View style={styles.headingSection}>
            <View style={styles.logoBadgeContainer}>
              <SlotSyncLogo size={58} />
            </View>
            <Text style={styles.pageTitle}>Creator Onboarding</Text>
            <Text style={styles.pageSubtitle}>
              Configure your professional services and availability to start receiving bookings.
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
              <Text style={[styles.stepTabLabel, currentStep === 2 && styles.stepTabLabelActive]}>Services</Text>
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
            <View style={styles.seamlessForm}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.accentViolet }]}>ACCOUNT CREDENTIALS</Text>
              </View>

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={[
                  styles.glassInputContainer,
                  focusedField === 'name' && styles.glassInputFocused,
                  isFullNameInvalid && styles.glassInputInvalid,
                  isFullNameValid && fullNameTouched && styles.glassInputValid
                ]}>
                  <View style={styles.iconHolder}>
                    <User
                      size={19}
                      color={isFullNameInvalid ? colors.danger : isFullNameValid && fullNameTouched ? colors.accentViolet : colors.primaryLight}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter full legal name"
                    placeholderTextColor={colors.textDim}
                    value={fullName}
                    onChangeText={(val) => {
                      setFullName(val);
                      if (!fullNameTouched) setFullNameTouched(true);
                    }}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => {
                      setFocusedField(null);
                      setFullNameTouched(true);
                    }}
                    autoCapitalize="words"
                  />
                  {fullNameTouched && (
                    <View style={styles.validationIconHolder}>
                      {isFullNameValid ? (
                        <CheckCircle2 size={18} color={colors.success} strokeWidth={2.4} />
                      ) : (
                        <AlertCircle size={18} color={colors.danger} strokeWidth={2.4} />
                      )}
                    </View>
                  )}
                </View>
                {isFullNameInvalid && (
                  <Text style={styles.helperErrorText}>Please enter your full legal name</Text>
                )}
              </View>

              {/* Email Address Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[
                  styles.glassInputContainer,
                  focusedField === 'email' && styles.glassInputFocused,
                  isEmailInvalid && styles.glassInputInvalid,
                  isEmailValid && emailTouched && styles.glassInputValid
                ]}>
                  <View style={styles.iconHolder}>
                    <Mail
                      size={19}
                      color={isEmailInvalid ? colors.danger : isEmailValid && emailTouched ? colors.accentViolet : colors.primaryLight}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="creator@example.com"
                    placeholderTextColor={colors.textDim}
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (!emailTouched) setEmailTouched(true);
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => {
                      setFocusedField(null);
                      setEmailTouched(true);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {emailTouched && (
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
                  <Text style={styles.helperErrorText}>Please enter a valid email address</Text>
                )}
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Phone Number</Text>
                <View style={[
                  styles.glassInputContainer,
                  focusedField === 'phone' && styles.glassInputFocused,
                  isPhoneInvalid && styles.glassInputInvalid,
                  isPhoneValid && phoneTouched && styles.glassInputValid
                ]}>
                  <View style={styles.iconHolder}>
                    <Phone
                      size={19}
                      color={isPhoneInvalid ? colors.danger : isPhoneValid && phoneTouched ? colors.accentViolet : colors.primaryLight}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+234 0800 000 0000"
                    placeholderTextColor={colors.textDim}
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val);
                      if (!phoneTouched) setPhoneTouched(true);
                    }}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => {
                      setFocusedField(null);
                      setPhoneTouched(true);
                    }}
                    keyboardType="phone-pad"
                  />
                  {phoneTouched && (
                    <View style={styles.validationIconHolder}>
                      {isPhoneValid ? (
                        <CheckCircle2 size={18} color={colors.success} strokeWidth={2.4} />
                      ) : (
                        <AlertCircle size={18} color={colors.danger} strokeWidth={2.4} />
                      )}
                    </View>
                  )}
                </View>
                {isPhoneInvalid && (
                  <Text style={styles.helperErrorText}>
                    {phoneDigits.length === 0
                      ? 'Please enter your business phone number'
                      : `Phone number must be 11 digits (${phoneDigits.length > 11 && !phoneDigits.startsWith('234') ? `${phoneDigits.length}/11 - too long` : `${phoneDigits.length}/11`})`}
                  </Text>
                )}
              </View>

              {/* Gender Selection */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <Text style={styles.subHint}>Select gender</Text>
                </View>
                <View style={styles.pillSelectorRow}>
                  {(['Male', 'Female'] as const).map((g) => {
                    const isSelected = gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        style={[styles.pillOption, isSelected && styles.pillOptionActiveViolet]}
                        onPress={() => setGender(g)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.pillOptionText, isSelected && styles.pillOptionTextActive]}>{g}</Text>
                        {isSelected && <Check size={14} color="#ffffff" strokeWidth={2.6} />}
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
                    styles.glassInputContainer,
                    isDobInvalid && styles.glassInputInvalid,
                    isDobValid && dobTouched && styles.glassInputValid
                  ]}
                >
                  <View style={styles.iconHolder}>
                    <Calendar
                      size={19}
                      color={isDobInvalid ? colors.danger : isDobValid && dobTouched ? colors.accentViolet : colors.primaryLight}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textDim}
                    value={dateOfBirth}
                    editable={false}
                    pointerEvents="none"
                  />
                  <TouchableOpacity
                    style={[styles.chooseDobBtn, { backgroundColor: colors.accentPurpleWash }]}
                    onPress={() => setShowDobPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chooseDobBtnText, { color: colors.accentViolet }]}>Select</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
                {isDobInvalid && (
                  <Text style={styles.helperErrorText}>Please enter a valid Date of Birth</Text>
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

              {/* Marital Status Dropdown */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Marital Status</Text>
                  <Text style={styles.subHint}>Tap to select</Text>
                </View>

                <TouchableOpacity
                  style={[styles.glassInputContainer, maritalDropdownOpen && styles.glassInputFocused]}
                  onPress={openMaritalDropdown}
                  activeOpacity={0.85}
                >
                  <View style={styles.iconHolder}>
                    <Heart
                      size={19}
                      color={maritalDropdownOpen ? colors.accentViolet : colors.primaryLight}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={[styles.textInput, { color: colors.textMain, fontWeight: '600' }]}>
                    {maritalStatus}
                  </Text>
                  <View style={styles.dropdownChevron}>
                    {maritalDropdownOpen
                      ? <ChevronUp size={17} color={colors.accentViolet} strokeWidth={2.4} />
                      : <ChevronDown size={17} color={colors.textDim} strokeWidth={2.4} />}
                  </View>
                </TouchableOpacity>

                {/* Marital Status Modal */}
                <Modal
                  visible={maritalDropdownOpen}
                  transparent
                  animationType="none"
                  onRequestClose={closeMaritalDropdown}
                  statusBarTranslucent
                >
                  <TouchableOpacity
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={closeMaritalDropdown}
                  >
                    <Animated.View
                      style={[
                        styles.dropdownPanel,
                        {
                          opacity: maritalDropdownAnim,
                          transform: [{
                            translateY: maritalDropdownAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-10, 0],
                            })
                          }]
                        }
                      ]}
                    >
                      <View style={styles.dropdownPanelHeader}>
                        <View style={[styles.dropdownPanelDot, { backgroundColor: colors.accentViolet }]} />
                        <Text style={[styles.dropdownPanelTitle, { color: colors.accentViolet }]}>SELECT MARITAL STATUS</Text>
                      </View>

                      {MARITAL_OPTIONS.map((option, index) => {
                        const isSelected = maritalStatus === option;
                        const isLast = index === MARITAL_OPTIONS.length - 1;
                        return (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.dropdownOptionRow,
                              isSelected && styles.dropdownOptionRowActiveViolet,
                              !isLast && styles.dropdownOptionRowBorder,
                            ]}
                            onPress={() => selectMaritalStatus(option)}
                            activeOpacity={0.8}
                          >
                            <Text style={[
                              styles.dropdownOptionText,
                              isSelected && styles.dropdownOptionTextActiveViolet,
                            ]}>
                              {option}
                            </Text>
                            {isSelected && (
                              <View style={[styles.dropdownCheckBadge, { backgroundColor: colors.accentViolet }]}>
                                <Check size={12} color="#ffffff" strokeWidth={3} />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </Animated.View>
                  </TouchableOpacity>
                </Modal>
              </View>


              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.glassInputContainer,
                  focusedField === 'password' && styles.glassInputFocused,
                  isPasswordInvalid && styles.glassInputInvalid,
                  isPasswordValid && passwordTouched && styles.glassInputValid
                ]}>
                  <View style={styles.iconHolder}>
                    <Lock
                      size={19}
                      color={isPasswordInvalid ? colors.danger : isPasswordValid && passwordTouched ? colors.accentViolet : colors.primaryLight}
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
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => {
                      setFocusedField(null);
                      setPasswordTouched(true);
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <View style={styles.rightActionsRow}>
                    {passwordTouched && (
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
                        <Eye size={19} color={colors.accentViolet} strokeWidth={2} />
                      ) : (
                        <EyeOff size={19} color={colors.textDim} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Single-Line Password Security Requirements */}
                {(focusedField === 'password' || password.length > 0 || passwordTouched) && (
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

                {isPasswordInvalid && (
                  <Text style={styles.helperErrorText}>Password must meet all requirements above</Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={[
                  styles.glassInputContainer,
                  focusedField === 'confirmPassword' && styles.glassInputFocused,
                  isConfirmPasswordInvalid && styles.glassInputInvalid,
                  isConfirmPasswordValid && confirmPasswordTouched && styles.glassInputValid
                ]}>
                  <View style={styles.iconHolder}>
                    <Lock
                      size={19}
                      color={isConfirmPasswordInvalid ? colors.danger : isConfirmPasswordValid && confirmPasswordTouched ? colors.accentViolet : colors.primaryLight}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="Re-enter password"
                    placeholderTextColor={colors.textDim}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (!confirmPasswordTouched) setConfirmPasswordTouched(true);
                    }}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => {
                      setFocusedField(null);
                      setConfirmPasswordTouched(true);
                    }}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <View style={styles.rightActionsRow}>
                    {confirmPasswordTouched && (
                      <View style={styles.validationIconHolder}>
                        {isConfirmPasswordValid ? (
                          <CheckCircle2 size={18} color={colors.success} strokeWidth={2.4} />
                        ) : (
                          <AlertCircle size={18} color={colors.danger} strokeWidth={2.4} />
                        )}
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.eyeToggleBtn}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showConfirmPassword ? (
                        <Eye size={19} color={colors.accentViolet} strokeWidth={2} />
                      ) : (
                        <EyeOff size={19} color={colors.textDim} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                {confirmPasswordTouched && isConfirmPasswordInvalid && (
                  <Text style={styles.helperErrorText}>
                    {confirmPassword.length === 0
                      ? 'Please confirm your password'
                      : !isPasswordValid
                      ? 'Ensure password meets all security rules first'
                      : 'Passwords do not match'}
                  </Text>
                )}
                {confirmPasswordTouched && isConfirmPasswordValid && (
                  <Text style={styles.helperSuccessText}>✓ Passwords match</Text>
                )}
              </View>
            </View>
          )}


          {/* STEP 2: CREATOR PROFILE DETAILS */}
          {currentStep === 2 && (
            <View style={styles.seamlessForm}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.accentViolet }]}>CREATOR SERVICE DETAILS</Text>
              </View>

              {/* Professional Category */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Professional Category</Text>
                  <Text style={styles.subHint}>Tap to choose</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScrollWrapper}
                  contentContainerStyle={styles.horizontalChipsScroll}
                >
                  {CATEGORIES.map((cat) => {
                    const isActive = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.modernCategoryChip,
                          isActive && styles.modernCategoryChipActiveViolet
                        ]}
                        activeOpacity={0.75}
                        onPress={() => setCategory(cat)}
                      >
                        {isActive && <Check size={13} color="#ffffff" strokeWidth={2.8} style={{ marginRight: 6 }} />}
                        <Text style={[
                          styles.modernCategoryChipText,
                          isActive && styles.modernCategoryChipTextActive
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Custom User-Added Categories */}
                  {customCategories.map((cat) => {
                    const isActive = category === cat;
                    return (
                      <View
                        key={cat}
                        style={[
                          styles.modernCategoryChip,
                          isActive && styles.modernCategoryChipActiveViolet,
                          styles.customTagWrapper
                        ]}
                      >
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                          onPress={() => setCategory(cat)}
                          activeOpacity={0.75}
                        >
                          {isActive && <Check size={13} color="#ffffff" strokeWidth={2.8} style={{ marginRight: 6 }} />}
                          <Text style={[
                            styles.modernCategoryChipText,
                            isActive && styles.modernCategoryChipTextActive
                          ]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveCustomCategory(cat)}
                          style={styles.removeTagBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <X size={13} color={isActive ? '#ffffff' : colors.textDim} strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Add Custom Category Input Row */}
                <View style={styles.addTagInputRow}>
                  <TextInput
                    style={styles.addTagInput}
                    placeholder="Type custom category..."
                    placeholderTextColor={colors.textDim}
                    value={newCategoryInput}
                    onChangeText={setNewCategoryInput}
                    onSubmitEditing={handleAddCustomCategory}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={[styles.addTagButtonViolet, !newCategoryInput.trim() && styles.addTagButtonDisabled]}
                    onPress={handleAddCustomCategory}
                    disabled={!newCategoryInput.trim()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addTagButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Consultation Mode Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Consultation Delivery Mode</Text>
                <View style={styles.modeCardsRow}>
                  {CONSULTATION_MODES.map((mode) => {
                    const isActive = consultationMode === mode.id;
                    return (
                      <TouchableOpacity
                        key={mode.id}
                        style={[styles.modeCard, isActive && styles.modeCardActiveViolet]}
                        onPress={() => setConsultationMode(mode.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                          {mode.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Office Address (for In-Person & Both) */}
              {consultationMode !== 'VIRTUAL' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Clinic / Office Address</Text>
                  <View style={styles.glassInputContainer}>
                    <View style={styles.iconHolder}>
                      <MapPin size={18} color={colors.accentViolet} strokeWidth={2} />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Suite, Street Address, City"
                      placeholderTextColor={colors.textDim}
                      value={officeAddress}
                      onChangeText={setOfficeAddress}
                    />
                  </View>
                </View>
              )}

              {/* Professional Title Input with Modern Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Professional Title</Text>
                <View style={styles.titleInputContainer}>
                  <TextInput
                    style={styles.textInputFull}
                    placeholder="e.g. Senior Consultant / Master Barber"
                    placeholderTextColor={colors.textDim}
                    value={title}
                    onChangeText={setTitle}
                  />
                  <TouchableOpacity
                    style={styles.titleDropdownChevron}
                    onPress={() => setShowTitleDropdown(!showTitleDropdown)}
                    activeOpacity={0.7}
                  >
                    {showTitleDropdown ? (
                      <ChevronUp size={18} color={colors.accentViolet} strokeWidth={2.2} />
                    ) : (
                      <ChevronDown size={18} color={colors.textDim} strokeWidth={2.2} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Expandable Dropdown Menu */}
                {showTitleDropdown && (
                  <View style={styles.modernDropdownCard}>
                    <View style={styles.dropdownHeader}>
                      <Text style={styles.dropdownHeaderTitle}>Suggested Titles for {category}</Text>
                    </View>
                    {currentTitleSuggestions.map((item) => {
                      const isSelected = title.trim().toLowerCase() === item.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[styles.dropdownItem, isSelected && styles.dropdownItemActiveViolet]}
                          activeOpacity={0.75}
                          onPress={() => {
                            setTitle(item);
                            setShowTitleDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                            {item}
                          </Text>
                          {isSelected && (
                            <Check size={15} color={colors.accentViolet} strokeWidth={2.5} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Hourly Consultation Rate */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Hourly Consultation Rate</Text>
                  <Text style={styles.subHint}>Currency: NGN (₦)</Text>
                </View>
                <View style={styles.rateInputRow}>
                  <Text style={styles.currencyPrefix}>₦</Text>
                  <TextInput
                    style={styles.rateTextInput}
                    placeholder="5000"
                    placeholderTextColor={colors.textDim}
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    keyboardType="numeric"
                  />
                  <Text style={styles.rateSuffix}>/ hr</Text>
                </View>
              </View>

              {/* Default Slot Duration Segmented Buttons */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Default Slot Duration</Text>
                  <View style={styles.recBadge}>
                    <Text style={styles.recBadgeText}>Recommended: 30m</Text>
                  </View>
                </View>

                <View style={styles.segmentedContainer}>
                  {SLOT_DURATIONS.map((dur) => {
                    const isActive = slotDuration === dur;
                    return (
                      <TouchableOpacity
                        key={dur}
                        style={[styles.segmentBtn, isActive && styles.segmentBtnActiveViolet]}
                        activeOpacity={0.8}
                        onPress={() => setSlotDuration(dur)}
                      >
                        <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                          {dur} mins
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Profile Bio */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Profile Bio / Introduction</Text>
                  <Text style={styles.charCountText}>{bio.length}/300</Text>
                </View>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textAreaInput}
                    placeholder="Write a brief introduction about your services, experience, and consultation topics..."
                    placeholderTextColor={colors.textDim}
                    value={bio}
                    onChangeText={setBio}
                    maxLength={300}
                    multiline
                    numberOfLines={4}
                  />
                  {bio.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearNotesBtn}
                      onPress={() => setBio('')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.clearNotesText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* STEP 3: OTP EMAIL VERIFICATION */}
          {currentStep === 3 && (
            <View style={styles.seamlessForm}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeaderTitle, { color: colors.accentViolet }]}>CREATOR VERIFICATION</Text>
              </View>

              <View style={styles.otpGlassInfoBox}>
                <Text style={styles.otpInfoText}>We sent a 6-digit security code to your email:</Text>
                <Text style={[styles.otpTargetEmail, { color: colors.accentViolet }]}>{email}</Text>
              </View>

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

                {otpError && (
                  <Text style={styles.inlineOtpErrorText}>{otpError}</Text>
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
                    <RotateCcw size={14} color={colors.accentViolet} />
                    <Text style={[styles.resendBtnText, { color: colors.accentViolet }]}>Resend Verification Code</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendTimerText}>
                    Resend code in <Text style={[styles.countdownBold, { color: colors.accentViolet }]}>{countdown}s</Text>
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
              style={styles.primaryActionButtonViolet}
              activeOpacity={0.88}
              onPress={handleStep1ToStep2}
            >
              <Text style={styles.actionButtonText}>Next: Service Profile</Text>
              <ArrowRight size={18} color="#ffffff" strokeWidth={2.4} />
            </TouchableOpacity>
          )}

          {currentStep === 2 && (
            <View style={styles.actionButtonRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.8}
                onPress={() => setCurrentStep(1)}
              >
                <Text style={styles.secondaryBtnText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionButtonViolet, { flex: 1.4 }, loading && styles.buttonDisabled]}
                activeOpacity={0.88}
                onPress={handleStep2Submit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>
                      {isGoogleVerified ? 'Create Profile' : 'Send Code'}
                    </Text>
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
                <ChevronLeft size={16} color={colors.textMuted} strokeWidth={2} />
                <Text style={styles.secondaryBtnText}>Edit Info</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionButtonViolet, { flex: 1.4 }, loading && styles.buttonDisabled]}
                activeOpacity={0.88}
                onPress={() => handleVerifyAndRegister()}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Verify & Create Profile</Text>
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
              {currentStep === 1 ? 'Credentials' : currentStep === 2 ? 'Service Details' : 'Verify Email'}
            </Text>
          </View>
        </View>
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
    borderColor: 'rgba(124, 58, 237, 0.2)',
    ...shadows.subtle,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 160,
    gap: 16,
  },
  animatedGlowPrimary: {
    position: 'absolute',
    top: -70,
    left: '10%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  animatedGlowSecondary: {
    position: 'absolute',
    top: 240,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logoBadgeContainer: {
    marginBottom: 10,
    ...shadows.violetGlow,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textHeading,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  stepProgressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 8,
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: colors.borderColor,
    ...shadows.subtle,
  },
  stepTabActive: {
    borderColor: colors.accentViolet,
    backgroundColor: colors.accentPurpleWash,
  },
  stepBadgeNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeNumActive: {
    backgroundColor: colors.accentViolet,
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
    color: colors.accentViolet,
    fontWeight: '800',
  },
  stepLineSeparator: {
    width: 14,
    height: 1.5,
    backgroundColor: '#CBD5E1',
  },
  seamlessForm: {
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
    backgroundColor: colors.accentViolet,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accentViolet,
    letterSpacing: 1.2,
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    letterSpacing: -0.1,
  },
  subHint: {
    fontSize: 11.5,
    color: colors.textDim,
    fontWeight: '500',
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
    borderColor: colors.accentViolet,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    ...shadows.card,
  },
  glassInputValid: {
    borderColor: '#C084FC',
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
    fontSize: 14.5,
    fontWeight: '500',
    color: colors.textMain,
  },
  textInputFull: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
    color: colors.textMain,
    height: 52,
    paddingHorizontal: 14,
  },
  eyeToggleBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseDobBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginRight: 4,
  },
  chooseDobBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
  modernCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8.5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    ...shadows.subtle,
  },
  modernCategoryChipActiveViolet: {
    backgroundColor: colors.accentViolet,
    borderColor: colors.accentViolet,
    ...shadows.violetGlow,
  },
  modernCategoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modernCategoryChipTextActive: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.textMain,
  },
  addTagButtonViolet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
    paddingHorizontal: 15,
    backgroundColor: colors.accentViolet,
    borderRadius: radii.md,
    justifyContent: 'center',
    ...shadows.subtle,
  },
  addTagButtonDisabled: {
    opacity: 0.5,
  },
  addTagButtonText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  modeCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  modeCardActiveViolet: {
    borderColor: colors.accentViolet,
    backgroundColor: colors.accentPurpleWash,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  modeLabelActive: {
    color: colors.accentViolet,
    fontWeight: '800',
  },
  titleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.9)',
    borderRadius: radii.md,
    ...shadows.subtle,
  },
  titleDropdownChevron: {
    padding: 14,
  },
  modernDropdownCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    padding: 10,
    marginTop: 4,
    ...shadows.card,
    gap: 4,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.accentViolet,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },
  dropdownItemActiveViolet: {
    backgroundColor: colors.accentPurpleWash,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
  dropdownItemTextActive: {
    color: colors.accentViolet,
    fontWeight: '800',
  },
  rateInputRow: {
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
  currencyPrefix: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.accentViolet,
    marginRight: 8,
  },
  rateTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  rateSuffix: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDim,
  },
  recBadge: {
    backgroundColor: colors.accentPurpleWash,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  recBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.accentViolet,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderRadius: radii.md,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  segmentBtnActiveViolet: {
    backgroundColor: '#FFFFFF',
    ...shadows.subtle,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.accentViolet,
    fontWeight: '900',
  },
  charCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  textAreaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.9)',
    borderRadius: radii.md,
    padding: 12,
    marginTop: 6,
    ...shadows.subtle,
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
    color: colors.danger,
  },
  otpGlassInfoBox: {
    backgroundColor: 'rgba(245, 243, 255, 0.85)',
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.25)',
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
    marginTop: 2,
  },
  inlineOtpErrorText: {
    color: colors.danger,
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
  },
  resendTimerText: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
  countdownBold: {
    fontWeight: '800',
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.9)',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    gap: 10,
    ...shadows.cardHover,
  },
  primaryActionButtonViolet: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.accentViolet,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.violetGlow,
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
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBtn: {
    flex: 0.6,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderWidth: 1,
    borderColor: colors.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  secondaryBtnText: {
    color: colors.textMuted,
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
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    ...shadows.subtle,
  },
  pillOptionActiveViolet: {
    backgroundColor: colors.accentViolet,
    borderColor: colors.accentViolet,
    ...shadows.violetGlow,
  },
  pillOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  pillOptionTextActive: {
    color: '#ffffff',
  },
  // Marital Status Dropdown
  dropdownChevron: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(124, 58, 237, 0.18)',
    overflow: 'hidden',
    ...shadows.modal,
  },
  dropdownPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.9)',
    backgroundColor: 'rgba(245, 243, 255, 0.6)',
  },
  dropdownPanelDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dropdownPanelTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  dropdownOptionRowActiveViolet: {
    backgroundColor: colors.accentPurpleWash,
  },
  dropdownOptionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.7)',
  },
  dropdownOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  dropdownOptionTextActiveViolet: {
    color: colors.accentViolet,
    fontWeight: '800',
  },
  dropdownCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
});
