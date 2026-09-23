import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Camera, User, Sparkles } from './LucideIcons';
import { colors } from '../theme/colors';

interface AvatarUploadProps {
  avatarUrl: string | null;
  onAvatarChange?: (newUrl: string) => void;
  size?: number;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

export default function AvatarUpload({
  avatarUrl,
  onAvatarChange,
  size = 80,
}: AvatarUploadProps) {
  const handleCycleAvatar = () => {
    if (!onAvatarChange) return;
    const currentIndex = SAMPLE_AVATARS.indexOf(avatarUrl || '');
    const nextIndex = (currentIndex + 1) % SAMPLE_AVATARS.length;
    onAvatarChange(SAMPLE_AVATARS[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}
        onPress={handleCycleAvatar}
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
            <Camera size={11} color="#ffffff" strokeWidth={2.5} />
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCycleAvatar} activeOpacity={0.7} style={styles.actionRow}>
        <Text style={styles.actionText}>
          {avatarUrl ? 'Change Profile Photo' : 'Add Profile Photo'}
        </Text>
      </TouchableOpacity>
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
});
