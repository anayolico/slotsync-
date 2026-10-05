import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Platform,
} from 'react-native';
import { colors, radii, shadows } from '../../theme/colors';
import SlotSyncLogo from '../../components/SlotSyncLogo';
import { ClientCardIcon, CreatorCardIcon } from '../../components/RoleCardIcons';
import { ArrowRight, Check, Sparkles } from '../../components/LucideIcons';
import AppBackground from '../../components/AppBackground';

interface Props {
  onSelectRole: (role: 'CLIENT' | 'CREATOR') => void;
  onGoToLogin: () => void;
}

export default function AuthChoiceScreen({ onSelectRole, onGoToLogin }: Props) {
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'CREATOR'>('CREATOR');



  return (
    <View style={styles.outerWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />
      <AppBackground variant="default" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >


        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <SlotSyncLogo size={76} />
          </View>

          <Text style={styles.brandTitle}>SlotSync</Text>
          <Text style={styles.brandSubtitle}></Text>

          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeHeading}>Choose your journey</Text>
            <Text style={styles.welcomeSubtitle}>Select how you will be using SlotSync to get started</Text>
          </View>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Role Option 1: Client */}
          <TouchableOpacity 
            style={[
              styles.choiceCard,
              selectedRole === 'CLIENT' && styles.choiceCardActive
            ]} 
            activeOpacity={0.88}
            onPress={() => {
              setSelectedRole('CLIENT');
              onSelectRole('CLIENT');
            }}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, styles.clientIconBadge]}>
                <ClientCardIcon size={24} color={colors.primary} />
              </View>
              <View style={[
                styles.radioIndicator,
                selectedRole === 'CLIENT' && styles.radioIndicatorActive
              ]}>
                {selectedRole === 'CLIENT' && <Check size={13} color="#ffffff" strokeWidth={3} />}
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Book Appointments</Text>
                <View style={styles.clientPill}>
                  <Text style={styles.clientPillText}>CLIENT</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Discover top doctors, lawyers, barbers, and consultants. Book confirmed calendar slots in seconds.
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.actionPromptText}>Continue as Client</Text>
              <ArrowRight size={16} color={colors.primary} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>

          {/* Role Option 2: Creator */}
          <TouchableOpacity 
            style={[
              styles.choiceCard,
              selectedRole === 'CREATOR' && styles.choiceCardActive
            ]} 
            activeOpacity={0.88}
            onPress={() => {
              setSelectedRole('CREATOR');
              onSelectRole('CREATOR');
            }}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, styles.creatorIconBadge]}>
                <CreatorCardIcon size={24} color={colors.accentViolet} />
              </View>
              <View style={[
                styles.radioIndicator,
                selectedRole === 'CREATOR' && styles.radioIndicatorActiveViolet
              ]}>
                {selectedRole === 'CREATOR' && <Check size={13} color="#ffffff" strokeWidth={3} />}
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Offer Consultations</Text>
                <View style={styles.creatorPill}>
                  <Text style={styles.creatorPillText}>CREATOR</Text>
                </View>
              </View>
              <Text style={styles.cardDescription}>
                Manage your weekly calendar rules, accept incoming booking requests, and get paid seamlessly.
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={[styles.actionPromptText, { color: colors.accentViolet }]}>Continue as Creator</Text>
              <ArrowRight size={16} color={colors.accentViolet} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Sign-In Section */}
        <View style={styles.footerSection}>
          <View style={styles.signInCard}>
            <Text style={styles.signInQuestion}>Already have a SlotSync account?</Text>
            <TouchableOpacity onPress={onGoToLogin} activeOpacity={0.7} style={styles.signInTouch}>
              <Text style={styles.signInLink}>Sign In to Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  animatedGlow: {
    position: 'absolute',
    top: -70,
    left: '12%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  logoContainer: {
    marginBottom: 14,
    ...shadows.primaryGlow,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    marginTop: 3,
    marginBottom: 16,
  },
  welcomeBlock: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcomeHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 4,
  },
  cardsContainer: {
    gap: 16,
    marginVertical: 12,
  },
  choiceCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    ...shadows.card,
  },
  choiceCardActive: {
    borderColor: colors.primary,
    ...shadows.cardHover,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientIconBadge: {
    backgroundColor: colors.primaryWash,
  },
  creatorIconBadge: {
    backgroundColor: colors.accentPurpleWash,
  },
  radioIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioIndicatorActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioIndicatorActiveViolet: {
    borderColor: colors.accentViolet,
    backgroundColor: colors.accentViolet,
  },
  cardBody: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionPromptText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  clientPill: {
    backgroundColor: colors.primaryWash,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  clientPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  creatorPill: {
    backgroundColor: colors.accentPurpleWash,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  creatorPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.accentViolet,
    letterSpacing: 0.5,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  signInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  signInQuestion: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  signInTouch: {
    paddingVertical: 4,
  },
  signInLink: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primary,
  },
});
