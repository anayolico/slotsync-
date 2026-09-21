import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, radii } from '../../theme/colors';

interface Props {
  currentUser: any;
  onLogout: () => void;
}

export default function ProfileScreen({ currentUser, onLogout }: Props) {
  const role = currentUser?.role || 'CLIENT';
  const isCreator = role === 'CREATOR';
  const creatorProfile = currentUser?.creator_profile;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatarLarge, isCreator && { backgroundColor: colors.accentCyan }]}>
          <Text style={styles.avatarLetter}>
            {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{currentUser?.full_name || 'SlotSync User'}</Text>
        <Text style={styles.userEmail}>{currentUser?.email || 'user@example.com'}</Text>

        <View style={[styles.roleBadge, isCreator && { backgroundColor: '#eefcfd', borderColor: '#a5f3fc' }]}>
          <Text style={[styles.roleBadgeText, isCreator && { color: colors.accentCyan }]}>
            {role} ACCOUNT
          </Text>
        </View>
      </View>

      <View style={styles.cardPanel}>
        <Text style={styles.panelTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID:</Text>
          <Text style={styles.infoValue}>{currentUser?.id ? `${currentUser.id.substring(0, 8)}...` : 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Registered Date:</Text>
          <Text style={styles.infoValue}>
            {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        {isCreator && creatorProfile && (
          <>
            <View style={styles.divider} />
            <Text style={styles.panelTitle}>Creator Configuration</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{creatorProfile.category || 'General'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Title:</Text>
              <Text style={styles.infoValue}>{creatorProfile.title || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hourly Rate:</Text>
              <Text style={[styles.infoValue, { color: colors.success }]}>${creatorProfile.hourly_rate || 0}/hr</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Slot Duration:</Text>
              <Text style={styles.infoValue}>{creatorProfile.slot_duration_minutes || 30} mins</Text>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Sign Out of Mobile App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bgApp,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  cardPanel: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderColor,
    gap: 10,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  logoutButton: {
    backgroundColor: colors.dangerBg,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },
});
