import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, radii } from '../../theme/colors';

interface Props {
  onSelectRole: (role: 'CLIENT' | 'CREATOR') => void;
  onGoToLogin: () => void;
}

export default function AuthChoiceScreen({ onSelectRole, onGoToLogin }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>✨</Text>
        </View>
        <Text style={styles.brandTitle}>SLOTSYNC</Text>
        <Text style={styles.brandSubtitle}>Appointment & Slot Engine</Text>
      </View>

      <Text style={styles.welcomeTitle}>Join SlotSync</Text>
      <Text style={styles.welcomeSubtitle}>Select how you will be using SlotSync today</Text>

      {/* Choice Cards */}
      <View style={styles.cardsContainer}>
        {/* Client Choice Card */}
        <TouchableOpacity 
          style={styles.choiceCard} 
          activeOpacity={0.85}
          onPress={() => onSelectRole('CLIENT')}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.subtleBg }]}>
            <Text style={styles.cardEmoji}>📅</Text>
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Book Appointments</Text>
            <Text style={styles.cardDescription}>
              I want to discover creators, view available calendar slots, and book consultations.
            </Text>
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>CLIENT</Text>
          </View>
        </TouchableOpacity>

        {/* Creator Choice Card */}
        <TouchableOpacity 
          style={[styles.choiceCard, styles.creatorCardBorder]} 
          activeOpacity={0.85}
          onPress={() => onSelectRole('CREATOR')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#eefcfd' }]}>
            <Text style={styles.cardEmoji}>👑</Text>
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Offer Consultations & Slots</Text>
            <Text style={styles.cardDescription}>
              I am a Doctor, Lawyer, Barber, Trainer, or Consultant managing my weekly schedule.
            </Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: '#eefcfd' }]}>
            <Text style={[styles.badgeText, { color: colors.accentCyan }]}>CREATOR</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have a SlotSync account?</Text>
        <TouchableOpacity onPress={onGoToLogin}>
          <Text style={styles.loginLink}>Sign In to Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bgApp,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoIcon: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDim,
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  choiceCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  creatorCardBorder: {
    borderColor: colors.accentCyan,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardTextContent: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgSubtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
});
