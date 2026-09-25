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
  MapPin, 
  Sparkles,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from '../../components/LucideIcons';
import { colors, radii } from '../../theme/colors';
import { registerUser, loginUser, sendEmailOtp, verifyEmailOtp } from '../../services/api';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import OtpInput from '../../components/OtpInput';
import { useToast } from '../../context/ToastContext';

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
  { id: 'BOTH', label: 'Both Virtual & Office' }
];
const SLOT_DURATIONS = [15, 30, 45, 60];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export default function RegisterCreatorScreen({ onRegisterSuccess, onBackToChoice }: Props) {
  const { showError, showWarning, showSuccess } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Credentials & Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);

  // Touched states
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

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
  const isPasswordValid = password.length >= 8;

  const isFullNameInvalid = fullNameTouched && !isFullNameValid;
  const isEmailInvalid = emailTouched && !isEmailValid;
  const isPhoneInvalid = phoneTouched && !isPhoneValid;
  const isPasswordInvalid = passwordTouched && !isPasswordValid;

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
    setPasswordTouched(true);

    if (!isFullNameValid || !isEmailValid || !isPhoneValid || (!isGoogleVerified && !isPasswordValid)) {
      showWarning('Please enter all required fields including a valid business phone number.', 'Incomplete Details');
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Submit = async () => {
    // Validate all compulsory fields for Creator
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
          <Text style={styles.pageTitle}>Creator Profile Onboarding</Text>
          <Text style={styles.pageSubtitle}>
            Set up your service catalog & availability schedule to start receiving bookings.
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
                  placeholder="Enter full legal name"
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
                  Please enter your full legal name (at least 2 characters)
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
                  placeholder="name@example.com"
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
                  Please enter a valid email address (e.g. name@example.com)
                </Text>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Phone Number</Text>

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

            {/* Password Input with Visibility Toggle */}
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

        {/* STEP 2: CREATOR PROFILE DETAILS */}
        {currentStep === 2 && (
          <View style={styles.formContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.headerIconDot} />
              <Text style={styles.sectionHeaderTitle}>CREATOR SERVICE DETAILS</Text>
            </View>

            {/* Professional Category */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Professional Category</Text>
                <Text style={styles.subHint}>Tap to select</Text>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.horizontalScrollWrapper}
                contentContainerStyle={styles.categoryPillsRow}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catPill,
                        isActive && styles.catPillActive
                      ]}
                      activeOpacity={0.75}
                      onPress={() => setCategory(cat)}
                    >
                      {isActive && <Check size={13} color="#ffffff" strokeWidth={2.8} style={{ marginRight: 6 }} />}
                      <Text style={[
                        styles.catPillText,
                        isActive && styles.catPillTextActive
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
                        styles.catPill,
                        isActive && styles.catPillActive,
                        styles.customCatWrapper
                      ]}
                    >
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => setCategory(cat)}
                        activeOpacity={0.75}
                      >
                        {isActive && <Check size={13} color="#ffffff" strokeWidth={2.8} style={{ marginRight: 6 }} />}
                        <Text style={[
                          styles.catPillText,
                          isActive && styles.catPillTextActive
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleRemoveCustomCategory(cat)}
                        style={styles.removeCatBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={13} color={isActive ? '#ffffff' : '#64748b'} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Add Custom Category Input Row */}
              <View style={styles.addCategoryInputRow}>
                <TextInput
                  style={styles.addCategoryInput}
                  placeholder="Type custom category (e.g. Software Engineer)..."
                  placeholderTextColor={colors.textDim}
                  value={newCategoryInput}
                  onChangeText={setNewCategoryInput}
                  onSubmitEditing={handleAddCustomCategory}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.addCategoryButton, !newCategoryInput.trim() && styles.addCategoryButtonDisabled]}
                  onPress={handleAddCustomCategory}
                  disabled={!newCategoryInput.trim()}
                  activeOpacity={0.8}
                >
                  <Plus size={14} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.addCategoryButtonText}>Add</Text>
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
                      style={[styles.modeCard, isActive && styles.modeCardActive]}
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

            {/* Office Address (Mandatory for In-Person & Both) */}
            {consultationMode !== 'VIRTUAL' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Clinic / Office Physical Address</Text>
                <View style={styles.inputWithIcon}>
                  <View style={styles.iconHolder}>
                    <MapPin size={18} color={colors.primary} strokeWidth={2} />
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
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Professional Title</Text>
              </View>

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
                    <ChevronUp size={18} color={colors.primary} strokeWidth={2.2} />
                  ) : (
                    <ChevronDown size={18} color="#64748b" strokeWidth={2.2} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Modern Expandable Dropdown Menu */}
              {showTitleDropdown && (
                <View style={styles.modernDropdownCard}>
                  <View style={styles.dropdownHeader}>
                    <Sparkles size={13} color={colors.primary} strokeWidth={2.2} />
                    <Text style={styles.dropdownHeaderTitle}>Suggested Titles for {category}</Text>
                  </View>
                  {currentTitleSuggestions.map((item) => {
                    const isSelected = title.trim().toLowerCase() === item.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.dropdownItem,
                          isSelected && styles.dropdownItemActive
                        ]}
                        activeOpacity={0.75}
                        onPress={() => {
                          setTitle(item);
                          setShowTitleDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextActive
                        ]}>
                          {item}
                        </Text>
                        {isSelected && (
                          <Check size={15} color={colors.primary} strokeWidth={2.5} />
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
                      style={[
                        styles.segmentBtn,
                        isActive && styles.segmentBtnActive
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSlotDuration(dur)}
                    >
                      <Text style={[
                        styles.segmentText,
                        isActive && styles.segmentTextActive
                      ]}>
                        {dur} mins
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Profile Bio Textarea (Compulsory) */}
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

        {/* STEP 3: OTP EMAIL VERIFICATION (Auto-verify + All Red Boxes on Error, No Top Error Alert) */}
        {currentStep === 3 && (
          <View style={styles.formContainer}>
            <View style={styles.sectionHeaderRow}>
              <ShieldCheck size={18} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.sectionHeaderTitle}>CREATOR VERIFICATION</Text>
            </View>

            <View style={styles.otpInfoBox}>
              <Text style={styles.otpInfoText}>
                We sent a 6-digit security code to your email:
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
            <Text style={styles.actionButtonText}>Next: Service Profile</Text>
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
                    {isGoogleVerified ? 'Create Profile' : 'Send Code'}
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

        {/* iOS Home Indicator Bar */}
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
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
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
    fontSize: 11,
    color: colors.textDim,
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
  inputWithoutIcon: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
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
  categoryPillsRow: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  catPill: {
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
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 3,
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  catPillTextActive: {
    color: '#ffffff',
  },
  customCatWrapper: {
    paddingRight: 8,
    gap: 6,
  },
  removeCatBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  addCategoryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  addCategoryInput: {
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
  addCategoryButton: {
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
  addCategoryButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  addCategoryButtonText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  dropdownToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  dropdownToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  titleInputContainer: {
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
  titleDropdownChevron: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernDropdownCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 8,
    marginTop: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    gap: 4,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 2,
  },
  dropdownHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  dropdownItemActive: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  dropdownItemTextActive: {
    color: colors.primary,
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
  modeCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  modeCardActive: {
    backgroundColor: '#eef2ff',
    borderColor: colors.primary,
  },
  modeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  modeLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  rateInputRow: {
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
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginRight: 6,
  },
  rateTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  rateSuffix: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textDim,
  },
  recBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  segmentTextActive: {
    color: '#ffffff',
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
    zIndex: 30,
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
});
