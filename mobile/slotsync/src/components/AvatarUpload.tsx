import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User, Sparkles, ImageIcon, X } from './LucideIcons';
import { colors } from '../theme/colors';
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
            <User size={size * 0.45} color="#94a3b8" strokeWidth={1.8} />
          </View>
        )}

        {/* Camera Badge */}
        <View style={styles.badgeHolder}>
          <View style={styles.cameraBadge}>
            {uploading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Camera size={11} color="#ffffff" strokeWidth={2.5} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7} style={styles.actionRow}>
        <Text style={styles.actionText}>
          {avatarUrl ? 'Change Profile Photo' : 'Add Profile Photo'}
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
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Take a selfie or choose an image from your device gallery.
            </Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                activeOpacity={0.8}
                onPress={handleTakePhoto}
              >
                <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
                  <Camera size={22} color={colors.primary} />
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>Take Photo</Text>
                  <Text style={styles.optionDesc}>Use your camera to take a selfie</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
              >
                <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                  <ImageIcon size={22} color="#10b981" />
                </View>
                <View style={styles.optionTextBox}>
                  <Text style={styles.optionTitle}>Choose from Gallery</Text>
                  <Text style={styles.optionDesc}>Select a photo from your photo library</Text>
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
    backgroundColor: '#ffffff',
    borderWidth: 2.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeHolder: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cameraBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  googleBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  actionRow: {
    marginTop: 6,
  },
  actionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
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
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  optionsContainer: {
    gap: 12,
    marginTop: 6,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    fontWeight: '700',
    color: '#0f172a',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});
