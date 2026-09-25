import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, radii } from '../../theme/colors';
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Lock,
  ChevronRight,
  ChevronLeft,
  Settings as SettingsIcon,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Camera,
  ShieldAlert,
  Sparkles,
  Sliders,
  Clock,
  Edit3,
  X,
  Check,
  ImageIcon,
} from '../../components/LucideIcons';
import OtpInput from '../../components/OtpInput';
import { useToast } from '../../context/ToastContext';
import {
  updateUserProfile,
  updateCreatorProfile,
  sendDeleteAccountOtp,
  confirmDeleteAccount,
  uploadAvatarImage,
} from '../../services/api';

interface Props {
  currentUser: any;
  onLogout: () => void;
  onProfileUpdated?: (updatedUser: any) => void;
}

// Preset avatar styles for easy selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80', // Doctor / Specialist
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', // Consultant / Professional
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', // Executive / Tech
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', // Lawyer / Specialist
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', // Barber / Stylist
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', // Fitness / Coach
];

const POPULAR_CATEGORIES = [
  'Doctor',
  'Dentist',
  'Lawyer',
  'Barber',
  'Hair Stylist',
  'Consultant',
  'Therapist',
  'Personal Trainer',
  'Tutor',
  'Photographer',
];

const SLOT_DURATIONS = [15, 30, 45, 60, 90];

const DELETION_REASONS = [
  'I am not getting enough client bookings',
  'I switched to another booking platform',
  'Technical difficulties or app usability issues',
  'Taking a temporary break from services',
  'High pricing or fee concerns',
  'Other reason',
];

export default function SettingsScreen({
  currentUser,
  onLogout,
  onProfileUpdated,
}: Props) {
  const { showSuccess, showError, showWarning } = useToast();
  const role = currentUser?.role || 'CLIENT';
  const isCreator = role === 'CREATOR';
  const creatorProfile = currentUser?.creator_profile || {};

  // View state: 'MAIN' | 'ACCOUNT_DETAILS'
  const [currentView, setCurrentView] = useState<'MAIN' | 'ACCOUNT_DETAILS'>('MAIN');

  // Form states for Account Details
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone_number || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [category, setCategory] = useState(creatorProfile?.category || 'Doctor');
  const [title, setTitle] = useState(creatorProfile?.title || 'Specialist');
  const [bio, setBio] = useState(creatorProfile?.bio || '');
  const [hourlyRate, setHourlyRate] = useState(String(creatorProfile?.hourly_rate ?? 0));
  const [slotDuration, setSlotDuration] = useState<number>(
    creatorProfile?.slot_duration_minutes || 30
  );
  const [saving, setSaving] = useState(false);

  // Avatar Picker Modal state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Process Avatar Image from Camera or Gallery
  const handleProcessAvatarUri = async (localUri: string) => {
    try {
      setUploadingAvatar(true);
      const uploadRes = await uploadAvatarImage(localUri);
      const finalUrl = uploadRes?.avatar_url || localUri;
      setAvatarUrl(finalUrl);
      setShowAvatarPicker(false);
      showSuccess('Profile photo updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated({
          ...currentUser,
          avatar_url: finalUrl,
        });
      }
    } catch (err: any) {
      setAvatarUrl(localUri);
      setShowAvatarPicker(false);
      showWarning('Photo selected locally.');
      if (onProfileUpdated) {
        onProfileUpdated({
          ...currentUser,
          avatar_url: localUri,
        });
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Launch Camera to Take Photo
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleProcessAvatarUri(result.assets[0].uri);
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to open camera');
    }
  };

  // Launch Gallery to Pick Photo
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required to select a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        mediaTypes: ['images'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleProcessAvatarUri(result.assets[0].uri);
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to open photo library');
    }
  };

  // Delete Account Flow States
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2 | 3>(1); // 1: Survey, 2: Warning, 3: OTP
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [confirmedLoss, setConfirmedLoss] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteOtpLoading, setDeleteOtpLoading] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(30);
  const [canResendDeleteOtp, setCanResendDeleteOtp] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  // Sign out confirmation modal
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Sync state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setPhoneNumber(currentUser.phone_number || '');
      setAvatarUrl(currentUser.avatar_url || '');
      if (currentUser.creator_profile) {
        setCategory(currentUser.creator_profile.category || 'Doctor');
        setTitle(currentUser.creator_profile.title || 'Specialist');
        setBio(currentUser.creator_profile.bio || '');
        setHourlyRate(String(currentUser.creator_profile.hourly_rate ?? 0));
        setSlotDuration(currentUser.creator_profile.slot_duration_minutes || 30);
      }
    }
  }, [currentUser]);

  // Countdown timer for Delete OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (deleteModalVisible && deleteStep === 3 && deleteCountdown > 0) {
      timer = setTimeout(() => setDeleteCountdown((c) => c - 1), 1000);
    } else if (deleteCountdown === 0) {
      setCanResendDeleteOtp(true);
    }
    return () => clearTimeout(timer);
  }, [deleteModalVisible, deleteStep, deleteCountdown]);

  // Handle Save Profile Changes
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      showError('Please enter your full name');
      return;
    }

    setSaving(true);
    try {
      // 1. Update basic user profile
      const userRes = await updateUserProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      });

      // 2. If creator, update creator profile
      if (isCreator) {
        await updateCreatorProfile({
          category: category.trim() || 'General',
          title: title.trim() || 'Specialist',
          bio: bio.trim(),
          hourly_rate: parseFloat(hourlyRate) || 0,
          slot_duration_minutes: slotDuration,
        });
      }

      showSuccess('Profile updated successfully!');
      if (onProfileUpdated) {
        onProfileUpdated({
          ...currentUser,
          ...userRes,
          creator_profile: {
            ...creatorProfile,
            category,
            title,
            bio,
            hourly_rate: parseFloat(hourlyRate) || 0,
            slot_duration_minutes: slotDuration,
          },
        });
      }
      setCurrentView('MAIN');
    } catch (err: any) {
      showError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Start Account Deletion Flow
  const handleOpenDeleteModal = () => {
    setSelectedReason('');
    setFeedbackNotes('');
    setConfirmedLoss(false);
    setDeleteOtp('');
    setDeleteStep(1);
    setDeleteModalVisible(true);
  };

  // Move to Step 2 (Warning)
  const handleProceedToWarning = () => {
    if (!selectedReason) {
      showWarning('Please select a reason for closing your account.');
      return;
    }
    setDeleteStep(2);
  };

  // Move to Step 3 (Send OTP & Verify)
  const handleSendDeleteOtp = async () => {
    if (!confirmedLoss) {
      showWarning('Please confirm that you understand the permanent data loss.');
      return;
    }

    setDeleteOtpLoading(true);
    try {
      const res = await sendDeleteAccountOtp();
      setMaskedEmail(res.masked_email || currentUser?.email || 'your email');
      setDeleteCountdown(30);
      setCanResendDeleteOtp(false);
      setDeleteStep(3);
      showSuccess('Verification code sent to your registered email.');
    } catch (err: any) {
      showError(err?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setDeleteOtpLoading(false);
    }
  };

  // Resend Delete OTP
  const handleResendDeleteOtp = async () => {
    if (!canResendDeleteOtp) return;
    setDeleteOtpLoading(true);
    try {
      const res = await sendDeleteAccountOtp();
      setMaskedEmail(res.masked_email || currentUser?.email || 'your email');
      setDeleteCountdown(30);
      setCanResendDeleteOtp(false);
      setDeleteOtp('');
      showSuccess('A fresh 6-digit verification code has been sent.');
    } catch (err: any) {
      showError(err?.message || 'Failed to resend code.');
    } finally {
      setDeleteOtpLoading(false);
    }
  };

  // Confirm Final Account Deletion
  const handleConfirmAccountDeletion = async () => {
    if (deleteOtp.length !== 6) {
      showWarning('Please enter the complete 6-digit verification code.');
      return;
    }

    setDeleteOtpLoading(true);
    try {
      await confirmDeleteAccount({
        otp_code: deleteOtp,
        reason: selectedReason,
        feedback: feedbackNotes,
      });

      setDeleteModalVisible(false);
      showSuccess('Your account and data have been permanently deleted.');
      // Execute logout and take user back to Login / Auth Choice
      setTimeout(() => {
        onLogout();
      }, 800);
    } catch (err: any) {
      showError(err?.message || 'Verification failed. Please check the code.');
    } finally {
      setDeleteOtpLoading(false);
    }
  };

  // Render Account Details & Profile Editor Screen
  if (currentView === 'ACCOUNT_DETAILS') {
    return (
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView('MAIN')}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Creator Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar / Profile Picture Picker Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    isCreator && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.avatarLetter}>
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.cameraBadge}
                activeOpacity={0.85}
                onPress={() => setShowAvatarPicker(true)}
              >
                <Camera size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.changeAvatarBtn}
              onPress={() => setShowAvatarPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.changeAvatarBtnText}>Change Profile Picture</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information Group */}
          <View style={styles.cardGroup}>
            <Text style={styles.groupHeader}>PERSONAL INFORMATION</Text>

            {/* Full Name */}
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputFieldBox}>
                <UserIcon size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Email (Readonly) */}
            <View style={styles.inputItem}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.verifiedTag}>
                  <CheckCircle2 size={12} color="#10b981" />
                  <Text style={styles.verifiedTagText}>Verified</Text>
                </View>
              </View>
              <View style={[styles.inputFieldBox, styles.inputFieldBoxDisabled]}>
                <Mail size={18} color={colors.textMuted} />
                <Text style={styles.disabledEmailText}>
                  {currentUser?.email || 'user@example.com'}
                </Text>
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputFieldBox}>
                <Phone size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+234 800 000 0000"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Creator Configuration (Only for Creator) */}
          {isCreator && (
            <View style={styles.cardGroup}>
              <Text style={styles.groupHeader}>CREATOR CONFIGURATION</Text>

              {/* Category */}
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Professional Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryPillRow}
                >
                  {POPULAR_CATEGORIES.map((cat) => {
                    const isSelected = category.toLowerCase() === cat.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryPill,
                          isSelected && styles.categoryPillActive,
                        ]}
                        onPress={() => setCategory(cat)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.categoryPillText,
                            isSelected && styles.categoryPillTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Title */}
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Professional Title</Text>
                <View style={styles.inputFieldBox}>
                  <Briefcase size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Senior Medical Specialist"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Hourly Rate */}
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Hourly Rate (₦/hr)</Text>
                <View style={styles.inputFieldBox}>
                  <Text style={styles.nairaPrefix}>₦</Text>
                  <TextInput
                    style={styles.textInput}
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Slot Duration */}
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Default Slot Duration (Minutes)</Text>
                <View style={styles.durationRow}>
                  {SLOT_DURATIONS.map((mins) => {
                    const isSelected = slotDuration === mins;
                    return (
                      <TouchableOpacity
                        key={mins}
                        style={[
                          styles.durationPill,
                          isSelected && styles.durationPillActive,
                        ]}
                        onPress={() => setSlotDuration(mins)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.durationPillText,
                            isSelected && styles.durationPillTextActive,
                          ]}
                        >
                          {mins}m
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Bio */}
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>About / Bio</Text>
                <View style={[styles.inputFieldBox, styles.textAreaBox]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Describe your expertise, experience and services..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Save Action Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            activeOpacity={0.88}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Danger Zone: Close Account */}
          <View style={styles.dangerCard}>
            <View style={styles.dangerHeaderRow}>
              <AlertTriangle size={20} color={colors.danger} />
              <Text style={styles.dangerTitle}>Danger Zone</Text>
            </View>
            <Text style={styles.dangerSubtitle}>
              Closing your account will permanently wipe your profile, appointment records, and schedule availability.
            </Text>
            <TouchableOpacity
              style={styles.closeAccountButton}
              activeOpacity={0.85}
              onPress={handleOpenDeleteModal}
            >
              <Trash2 size={16} color={colors.danger} />
              <Text style={styles.closeAccountButtonText}>Close Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Avatar Picker Modal */}
        <Modal
          visible={showAvatarPicker}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!uploadingAvatar) setShowAvatarPicker(false);
          }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.avatarModalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Choose Profile Picture</Text>
                <TouchableOpacity
                  onPress={() => setShowAvatarPicker(false)}
                  style={styles.closeModalBtn}
                  disabled={uploadingAvatar}
                >
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {uploadingAvatar ? (
                <View style={styles.uploadingBox}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.uploadingText}>Uploading profile photo...</Text>
                </View>
              ) : (
                <>
                  {/* Photo / Camera Actions */}
                  <View style={styles.avatarActionContainer}>
                    <TouchableOpacity
                      style={styles.avatarActionCard}
                      activeOpacity={0.8}
                      onPress={handleTakePhoto}
                    >
                      <View style={[styles.avatarActionIconBox, { backgroundColor: '#eef2ff' }]}>
                        <Camera size={22} color={colors.primary} />
                      </View>
                      <View style={styles.avatarActionTextBox}>
                        <Text style={styles.avatarActionTitle}>Take Photo</Text>
                        <Text style={styles.avatarActionSub}>Take a selfie with camera</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.avatarActionCard}
                      activeOpacity={0.8}
                      onPress={handlePickFromGallery}
                    >
                      <View style={[styles.avatarActionIconBox, { backgroundColor: '#ecfdf5' }]}>
                        <ImageIcon size={22} color="#10b981" />
                      </View>
                      <View style={styles.avatarActionTextBox}>
                        <Text style={styles.avatarActionTitle}>Choose from Gallery</Text>
                        <Text style={styles.avatarActionSub}>Select from device photos</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerLabel}>Or choose an aesthetic preset</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Presets Grid */}
                  <View style={styles.avatarGrid}>
                    {AVATAR_PRESETS.map((url, index) => {
                      const isSelected = avatarUrl === url;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.avatarGridItem,
                            isSelected && styles.avatarGridItemActive,
                          ]}
                          onPress={() => {
                            setAvatarUrl(url);
                            setShowAvatarPicker(false);
                            if (onProfileUpdated) {
                              onProfileUpdated({
                                ...currentUser,
                                avatar_url: url,
                              });
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: url }} style={styles.presetImg} />
                          {isSelected && (
                            <View style={styles.presetCheckOverlay}>
                              <Check size={16} color="#ffffff" strokeWidth={3} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Custom URL Input */}
                  <View style={styles.customUrlContainer}>
                    <Text style={styles.customUrlLabel}>Or paste Image URL</Text>
                    <View style={styles.customUrlInputRow}>
                      <TextInput
                        style={styles.customUrlInput}
                        placeholder="https://example.com/photo.jpg"
                        placeholderTextColor={colors.textMuted}
                        value={customAvatarInput}
                        onChangeText={setCustomAvatarInput}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.applyUrlBtn}
                        onPress={() => {
                          if (customAvatarInput.trim()) {
                            setAvatarUrl(customAvatarInput.trim());
                            if (onProfileUpdated) {
                              onProfileUpdated({
                                ...currentUser,
                                avatar_url: customAvatarInput.trim(),
                              });
                            }
                            setCustomAvatarInput('');
                            setShowAvatarPicker(false);
                          }
                        }}
                      >
                        <Text style={styles.applyUrlBtnText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Delete Account Step-by-Step Flow Modal */}
        {renderDeleteAccountModal()}
      </View>
    );
  }

  // ── Main Settings Screen View ──
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.mainHeader}>
        <Text style={styles.screenMainTitle}>Settings</Text>
        <Text style={styles.screenMainSubtitle}>
          Manage account, profile, security & preferences
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Creator / User Profile Summary Card */}
        <TouchableOpacity
          style={styles.profileSummaryCard}
          activeOpacity={0.88}
          onPress={() => setCurrentView('ACCOUNT_DETAILS')}
        >
          <View style={styles.profileSummaryLeft}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.summaryAvatar} />
            ) : (
              <View
                style={[
                  styles.summaryAvatarPlaceholder,
                  isCreator && { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.summaryAvatarLetter}>
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}

            <View style={styles.profileSummaryInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.summaryName} numberOfLines={1}>
                  {fullName || 'SlotSync User'}
                </Text>
              </View>
              <Text style={styles.summaryEmail} numberOfLines={1}>
                {currentUser?.email || 'user@example.com'}
              </Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>
                  {isCreator ? `CREATOR • ${category}` : 'CLIENT ACCOUNT'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryChevronBox}>
            <ChevronRight size={20} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        {/* App Information & Security */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupHeader}>SECURITY & PREFERENCES</Text>

          <View style={styles.menuItemDisabled}>
            <View style={[styles.menuIconBox, { backgroundColor: '#dcfce7' }]}>
              <CheckCircle2 size={20} color="#10b981" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Email Verification</Text>
              <Text style={styles.menuItemSubtitle}>
                Protected by 2-factor OTP authorization
              </Text>
            </View>
          </View>

          {/* Close Account Item in Main Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleOpenDeleteModal}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#fee2e2' }]}>
              <Trash2 size={20} color={colors.danger} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: colors.danger }]}>
                Close Account
              </Text>
              <Text style={styles.menuItemSubtitle}>
                Permanently close account & delete all data
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* App Version Info */}
        <View style={styles.versionCard}>
          <Text style={styles.versionText}>SlotSync Mobile v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with high performance & real-time sync</Text>
        </View>

        {/* Logout Button at the Bottom */}
        <TouchableOpacity
          style={styles.logoutMainButton}
          activeOpacity={0.88}
          onPress={() => setLogoutModalVisible(true)}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.logoutMainButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModalCard}>
            <View style={styles.logoutIconCircle}>
              <LogOut size={28} color={colors.danger} />
            </View>

            <Text style={styles.confirmModalTitle}>Sign Out?</Text>
            <Text style={styles.confirmModalSubtitle}>
              Are you sure you want to sign out of your SlotSync account on this device?
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalLogoutBtn}
                onPress={() => {
                  setLogoutModalVisible(false);
                  onLogout();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalLogoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Step-by-Step Flow Modal */}
      {renderDeleteAccountModal()}
    </View>
  );

  // Helper to Render Account Deletion Multi-Step Modal
  function renderDeleteAccountModal() {
    return (
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.deleteModalCard}>
            {/* Modal Top Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.stepIndicatorRow}>
                <View
                  style={[
                    styles.stepBadge,
                    deleteStep >= 1 && styles.stepBadgeActive,
                  ]}
                >
                  <Text style={styles.stepBadgeText}>1</Text>
                </View>
                <View style={styles.stepConnector} />
                <View
                  style={[
                    styles.stepBadge,
                    deleteStep >= 2 && styles.stepBadgeActive,
                  ]}
                >
                  <Text style={styles.stepBadgeText}>2</Text>
                </View>
                <View style={styles.stepConnector} />
                <View
                  style={[
                    styles.stepBadge,
                    deleteStep >= 3 && styles.stepBadgeActive,
                  ]}
                >
                  <Text style={styles.stepBadgeText}>3</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* STEP 1: Survey & Reasons */}
            {deleteStep === 1 && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.deleteIconCenter}>
                  <ShieldAlert size={36} color={colors.danger} />
                </View>

                <Text style={styles.deleteStepTitle}>Why are you closing your account?</Text>
                <Text style={styles.deleteStepSubtitle}>
                  Please let us know the reason to help us improve our service.
                </Text>

                <View style={styles.reasonsList}>
                  {DELETION_REASONS.map((reason, idx) => {
                    const isSelected = selectedReason === reason;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.reasonOption,
                          isSelected && styles.reasonOptionSelected,
                        ]}
                        onPress={() => setSelectedReason(reason)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleActive,
                          ]}
                        >
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                        <Text
                          style={[
                            styles.reasonText,
                            isSelected && styles.reasonTextActive,
                          ]}
                        >
                          {reason}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Optional Feedback */}
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackLabel}>Additional Feedback (Optional)</Text>
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Tell us what we could have done better..."
                    placeholderTextColor={colors.textMuted}
                    value={feedbackNotes}
                    onChangeText={setFeedbackNotes}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryDeleteActionBtn,
                    !selectedReason && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleProceedToWarning}
                  disabled={!selectedReason}
                >
                  <Text style={styles.primaryDeleteActionText}>
                    Continue to Verification →
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* STEP 2: Danger Warning & Loss Confirmation */}
            {deleteStep === 2 && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.deleteIconCenter, { backgroundColor: '#fee2e2' }]}>
                  <AlertTriangle size={36} color={colors.danger} />
                </View>

                <Text style={styles.deleteStepTitle}>Permanent Loss Warning</Text>
                <Text style={styles.deleteStepSubtitle}>
                  Closing your account is irreversible. The following data will be permanently wiped:
                </Text>

                <View style={styles.lossCard}>
                  <View style={styles.lossItem}>
                    <Text style={styles.lossBullet}>✕</Text>
                    <Text style={styles.lossText}>All client booking history and upcoming appointments</Text>
                  </View>
                  <View style={styles.lossItem}>
                    <Text style={styles.lossBullet}>✕</Text>
                    <Text style={styles.lossText}>Your weekly availability rules & booking slots</Text>
                  </View>
                  <View style={styles.lossItem}>
                    <Text style={styles.lossBullet}>✕</Text>
                    <Text style={styles.lossText}>Your professional creator profile & rates</Text>
                  </View>
                </View>

                {/* Loss Confirmation Checkbox */}
                <TouchableOpacity
                  style={styles.confirmCheckboxRow}
                  activeOpacity={0.8}
                  onPress={() => setConfirmedLoss(!confirmedLoss)}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      confirmedLoss && styles.checkboxBoxActive,
                    ]}
                  >
                    {confirmedLoss && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </View>
                  <Text style={styles.confirmCheckboxText}>
                    I understand that closing my account is permanent and cannot be undone.
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setDeleteStep(1)}
                  >
                    <Text style={styles.modalCancelBtnText}>← Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sendOtpDangerBtn,
                      (!confirmedLoss || deleteOtpLoading) && styles.buttonDisabled,
                    ]}
                    activeOpacity={0.85}
                    onPress={handleSendDeleteOtp}
                    disabled={!confirmedLoss || deleteOtpLoading}
                  >
                    {deleteOtpLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.sendOtpDangerBtnText}>Send Closure Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* STEP 3: Email OTP Verification & Final Delete */}
            {deleteStep === 3 && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.deleteIconCenter, { backgroundColor: '#fee2e2' }]}>
                  <Lock size={36} color={colors.danger} />
                </View>

                <Text style={styles.deleteStepTitle}>Verify Account Closure</Text>
                <Text style={styles.deleteStepSubtitle}>
                  For your protection, enter the 6-digit verification code sent to{' '}
                  <Text style={{ fontWeight: '700', color: colors.textMain }}>
                    {maskedEmail}
                  </Text>
                </Text>

                {/* 6-Digit OTP Box */}
                <View style={{ marginVertical: 18 }}>
                  <OtpInput
                    code={deleteOtp}
                    onChangeCode={setDeleteOtp}
                    isInvalid={false}
                  />
                </View>

                {/* Resend Timer */}
                <View style={styles.resendRow}>
                  {deleteCountdown > 0 ? (
                    <Text style={styles.countdownText}>
                      Resend code in {deleteCountdown}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleResendDeleteOtp}
                      disabled={deleteOtpLoading}
                    >
                      <Text style={styles.resendActionText}>Resend Code</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setDeleteStep(2)}
                  >
                    <Text style={styles.modalCancelBtnText}>← Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.finalDeleteConfirmBtn,
                      (deleteOtp.length !== 6 || deleteOtpLoading) && styles.buttonDisabled,
                    ]}
                    activeOpacity={0.85}
                    onPress={handleConfirmAccountDeletion}
                    disabled={deleteOtp.length !== 6 || deleteOtpLoading}
                  >
                    {deleteOtpLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.finalDeleteConfirmBtnText}>
                        Permanently Delete Account
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  screenMainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  screenMainSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
    gap: 20,
  },
  profileSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  profileSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  summaryAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#e0e7ff',
  },
  summaryAvatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryAvatarLetter: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  profileSummaryInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  summaryEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  summaryChevronBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuGroup: {
    gap: 8,
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginLeft: 4,
    marginBottom: 4,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuItemDisabled: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    opacity: 0.9,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  versionCard: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  versionSubtext: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 2,
  },
  logoutMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 6,
  },
  logoutMainButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.danger,
  },
  // ── Account Details Screen Styles ──
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  changeAvatarBtn: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
  },
  changeAvatarBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  cardGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  inputItem: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  inputFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  inputFieldBoxDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  disabledEmailText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  nairaPrefix: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  textAreaBox: {
    height: 84,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  categoryPillRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  durationPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  durationPillTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  dangerCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 10,
    marginTop: 10,
  },
  dangerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.danger,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: '#991b1b',
    lineHeight: 18,
  },
  closeAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  closeAccountButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
  // ── Modals ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  avatarModalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  closeModalBtn: {
    padding: 4,
  },
  uploadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  avatarActionContainer: {
    gap: 10,
  },
  avatarActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  avatarActionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActionTextBox: {
    flex: 1,
  },
  avatarActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  avatarActionSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  avatarGridItem: {
    position: 'relative',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  avatarGridItemActive: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  presetCheckOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customUrlContainer: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  customUrlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  customUrlInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customUrlInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0f172a',
  },
  applyUrlBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  applyUrlBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  // ── Confirm / Logout Modal ──
  confirmModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  confirmModalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  modalLogoutBtn: {
    flex: 1,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalLogoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  // ── Delete Multi-step Modal ──
  deleteModalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: colors.danger,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  stepConnector: {
    width: 20,
    height: 2,
    backgroundColor: '#e2e8f0',
  },
  deleteIconCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 6,
  },
  deleteStepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  deleteStepSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  reasonsList: {
    gap: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  reasonOptionSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.danger,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  reasonText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  reasonTextActive: {
    color: colors.danger,
    fontWeight: '700',
  },
  feedbackContainer: {
    marginTop: 12,
    gap: 6,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  feedbackInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
    height: 60,
    textAlignVertical: 'top',
  },
  primaryDeleteActionBtn: {
    backgroundColor: colors.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryDeleteActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  lossCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  lossItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  lossBullet: {
    color: colors.danger,
    fontWeight: '900',
    fontSize: 13,
  },
  lossText: {
    flex: 1,
    fontSize: 12,
    color: '#991b1b',
    lineHeight: 18,
    fontWeight: '600',
  },
  confirmCheckboxRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxBoxActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  confirmCheckboxText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
    lineHeight: 18,
  },
  sendOtpDangerBtn: {
    flex: 1.4,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendOtpDangerBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  resendActionText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '800',
  },
  finalDeleteConfirmBtn: {
    flex: 1.6,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  finalDeleteConfirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
