import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { colors, radii, chromatic, glass, shadows } from '../../theme/colors';
import { User, Mail, Calendar, Briefcase, Clock, Sparkles, LogOut, ShieldCheck, DollarSign, Tag } from 'lucide-react-native';
import AppBackground from '../../components/AppBackground';

interface Props {
  currentUser: any;
  onLogout: () => void;
}

export default function ProfileScreen({ currentUser, onLogout }: Props) {
  const role = currentUser?.role || 'CLIENT';
  const isCreator = role === 'CREATOR';
  const creatorProfile = currentUser?.creator_profile;

  return (
    <AppBackground variant={isCreator ? 'violet' : 'indigo'}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />

      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLetter}>
            {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{currentUser?.full_name || 'SlotSync User'}</Text>
        <Text style={styles.userEmail}>{currentUser?.email || 'user@example.com'}</Text>

        <View style={[styles.roleBadge, isCreator ? styles.creatorRoleBadge : styles.clientRoleBadge]}>
          <Sparkles size={12} color={isCreator ? chromatic.indigo.primary : chromatic.emerald.primary} />
          <Text style={[styles.roleBadgeText, { color: isCreator ? chromatic.indigo.primary : chromatic.emerald.primary }]}>
            {role} ACCOUNT
          </Text>
        </View>
      </View>

      {/* Basic Account Info Panel */}
      <View style={styles.cardPanel}>
        <View style={styles.panelTitleRow}>
          <ShieldCheck size={16} color={chromatic.indigo.primary} />
          <Text style={styles.panelTitle}>Account Details</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue}>{currentUser?.id ? `${currentUser.id.substring(0, 10)}...` : 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Registered On</Text>
          <Text style={styles.infoValue}>
            {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
          </Text>
        </View>

        {currentUser?.phone_number ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{currentUser.phone_number}</Text>
          </View>
        ) : null}
      </View>

      {/* Creator Configuration Panel */}
      {isCreator && creatorProfile && (
        <View style={styles.cardPanel}>
          <View style={styles.panelTitleRow}>
            <Briefcase size={16} color={chromatic.violet.primary} />
            <Text style={styles.panelTitle}>Specialist Configuration</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{creatorProfile.category || 'General'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Title</Text>
            <Text style={styles.infoValue}>{creatorProfile.title || 'Specialist'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hourly Rate</Text>
            <Text style={[styles.infoValue, { color: chromatic.indigo.primary, fontWeight: '800' }]}>
              ₦{creatorProfile.hourly_rate || 0}/hr
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Slot Duration</Text>
            <Text style={styles.infoValue}>{creatorProfile.slot_duration_minutes || 30} mins</Text>
          </View>
        </View>
      )}

      {/* Sign Out Action Button */}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.88} onPress={onLogout}>
        <LogOut size={18} color={chromatic.rose.primary} />
        <Text style={styles.logoutButtonText}>Sign Out of Mobile App</Text>
      </TouchableOpacity>
    </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 60 : 46,
    paddingBottom: 40,
    gap: 18,
  },
  ambientGlowIndigo: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  ambientGlowViolet: {
    position: 'absolute',
    bottom: 80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(168, 85, 247, 0.10)',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: chromatic.indigo.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: chromatic.indigo.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3730A3',
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    gap: 6,
  },
  creatorRoleBadge: {
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
  },
  clientRoleBadge: {
    backgroundColor: chromatic.emerald.bg,
    borderColor: chromatic.emerald.border,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cardPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  categoryPill: {
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: chromatic.indigo.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: chromatic.rose.bg,
    borderColor: chromatic.rose.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 10,
  },
  logoutButtonText: {
    color: chromatic.rose.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});

