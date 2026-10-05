import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User, Sparkles, ImageIcon, X } from './LucideIcons';
import { colors, radii, chromatic, glass, shadows } from '../theme/colors';
import { uploadAvatarImage } from '../services/api';

interface AvatarUploadProps {
  avatarUrl: string | null;
  onAvatarChange?: (newUrl: string) => void;
  size?: number;
}

export default function AvatarUpload({
  avatarUrl,
  onAvatarChange,
  size = 80,
}: AvatarUploadProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        const localUri = result.assets[0].uri;
        setModalVisible(false);
        try {
          setUploading(true);
          const uploadRes = await uploadAvatarImage(localUri);
          const finalUrl = uploadRes?.avatar_url || localUri;
          onAvatarChange?.(finalUrl);
        } catch {
          onAvatarChange?.(localUri);
        } finally {
          setUploading(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Camera Error', err?.message || 'Failed to open camera.');
    }
  };

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
        const localUri = result.assets[0].uri;
        setModalVisible(false);
        try {
          setUploading(true);
          const uploadRes = await uploadAvatarImage(localUri);
          const finalUrl = uploadRes?.avatar_url || localUri;
          onAvatarChange?.(finalUrl);
        } catch {
          onAvatarChange?.(localUri);
        } finally {
          setUploading(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Gallery Error', err?.message || 'Failed to open photo library.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} />
        ) : (
          <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <User size={size * 0.44} color={chromatic.indigo.primary} strokeWidth={2} />
          </View>
        )}

        {/* Camera Badge */}
        <View style={styles.badgeHolder}>
          <View style={styles.cameraBadge}>
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Camera size={13} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.75} style={styles.actionRow}>
        <Sparkles size={12} color={chromatic.indigo.primary} />
        <Text style={styles.actionText}>
          {avatarUrl ? 'Change Profile Photo' : 'Upload Photo'}
        </Text>
      </TouchableOpacity>

      {/* Choose Option Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Profile Photo</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Take a selfie with camera or choose an image from your photo library.
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                activeOpacity={0.8}
                onPress={handleTakePhoto}
              >
                <View style={[styles.iconBox, { backgroundColor: chromatic.indigo.bg }]}>
                  <Camera size={22} color={chromatic.indigo.primary} />
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>Take Photo</Text>
                  <Text style={styles.optionDesc}>Use your device camera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
              >
                <View style={[styles.iconBox, { backgroundColor: chromatic.emerald.bg }]}>
                  <ImageIcon size={22} color={chromatic.emerald.primary} />
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>Choose from Gallery</Text>
                  <Text style={styles.optionDesc}>Select from device photos</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarCircle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: chromatic.indigo.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: chromatic.indigo.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: chromatic.indigo.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeHolder: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  cameraBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: chromatic.indigo.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
    color: chromatic.indigo.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  optionsContainer: {
    gap: 10,
    marginTop: 6,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextBox: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});

