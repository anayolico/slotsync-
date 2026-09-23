import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Platform 
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import { ClientCardIcon, CreatorCardIcon } from '../../components/RoleCardIcons';

interface Props {
  onSelectRole: (role: 'CLIENT' | 'CREATOR') => void;
  onGoToLogin: () => void;
}

export default function AuthChoiceScreen({ onSelectRole, onGoToLogin }: Props) {
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'CREATOR'>('CREATOR');

  return (
    <View style={styles.outerWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Background Decorative Glow */}
        <View style={styles.topGlow} />

        {/* Header Section */}
        <View style={styles.header}>
          {/* App Logo Badge */}
          <View style={styles.logoContainer}>
            <SlotSyncLogo size={72} />
          </View>

          {/* Branding Titles */}
          <Text style={styles.brandTitle}>SLOTSYNC</Text>
          <Text style={styles.brandSubtitle}>APPOINTMENT & SLOT ENGINE</Text>

          {/* Subtitle Heading */}
          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeSubtitle}>Select how you will be using SlotSync today</Text>
          </View>
        </View>

        {/* Role Selection Options */}
        <View style={styles.cardsContainer}>
          {/* Role Option 1: Client */}
          <TouchableOpacity 
            style={[
              styles.choiceCard,
              selectedRole === 'CLIENT' && styles.choiceCardActive
            ]} 
            activeOpacity={0.85}
            onPress={() => {
              setSelectedRole('CLIENT');
              onSelectRole('CLIENT');
            }}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, styles.clientIconBadge]}>
                <ClientCardIcon size={24} color={colors.primary} />
              </View>
              {/* Radio Indicator */}
              <View style={[
                styles.radioIndicator,
                selectedRole === 'CLIENT' && styles.radioIndicatorActive
              ]}>
                {selectedRole === 'CLIENT' && <Text style={styles.radioCheck}>✓</Text>}
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Book Appointments</Text>
              <Text style={styles.cardDescription}>
                I want to discover creators, view available calendar slots, and book consultations.
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.clientPill}>
                <Text style={styles.clientPillText}>CLIENT</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Role Option 2: Creator */}
          <TouchableOpacity 
            style={[
              styles.choiceCard,
              selectedRole === 'CREATOR' && styles.choiceCardActive
            ]} 
            activeOpacity={0.85}
            onPress={() => {
              setSelectedRole('CREATOR');
              onSelectRole('CREATOR');
            }}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, styles.creatorIconBadge]}>
                <CreatorCardIcon size={24} color="#0891b2" />
              </View>
              {/* Radio Indicator */}
              <View style={[
                styles.radioIndicator,
                selectedRole === 'CREATOR' && styles.radioIndicatorActive
              ]}>
                {selectedRole === 'CREATOR' && <Text style={styles.radioCheck}>✓</Text>}
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Offer Consultations & Slots</Text>
              <Text style={styles.cardDescription}>
                I am a Doctor, Lawyer, Barber, Trainer, or Consultant managing my weekly schedule.
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.creatorPill}>
                <Text style={styles.creatorPillText}>CREATOR</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={styles.footerSection}>
          <View style={styles.signInRow}>
            <Text style={styles.signInQuestion}>Already have a SlotSync account?</Text>
            <TouchableOpacity onPress={onGoToLogin} activeOpacity={0.7}>
              <Text style={styles.signInLink}>Sign In to Account</Text>
            </TouchableOpacity>
          </View>

          {/* iOS Home Indicator Bar */}
          <View style={styles.homeIndicator} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    left: '20%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    transform: [{ scaleX: 1.5 }],
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 12,
  },
  logoContainer: {
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 24,
  },
  welcomeBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 16,
    marginVertical: 16,
  },
  choiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  choiceCardActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  clientIconBadge: {
    backgroundColor: '#eef2ff',
    borderColor: '#e0e7ff',
  },
  creatorIconBadge: {
    backgroundColor: '#faf5ff',
    borderColor: '#f3e8ff',
  },
  badgeEmoji: {
    fontSize: 22,
  },
  radioIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  radioIndicatorActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    marginTop: Platform.OS === 'ios' ? -1 : -2,
  },
  cardBody: {
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
  },
  clientPill: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  clientPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  creatorPill: {
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  creatorPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0891b2',
    letterSpacing: 0.8,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  signInRow: {
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  signInQuestion: {
    fontSize: 12.5,
    color: colors.textMuted,
    fontWeight: '500',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    marginTop: 20,
    opacity: 0.6,
  },
});
