import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { registerUser, loginUser } from '../../services/api';

interface Props {
  onRegisterSuccess: () => void;
  onBackToChoice: () => void;
}

const INTEREST_CATEGORIES = ['General', 'Healthcare', 'Legal', 'Grooming', 'Fitness', 'Consulting'];

export default function RegisterClientScreen({ onRegisterSuccess, onBackToChoice }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredCategory, setPreferredCategory] = useState('General');
  const [clientNotes, setClientNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role: 'CLIENT',
      });

      // Auto login after register
      await loginUser(email.trim(), password);
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create client account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Sticky Top Header Navigation */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToChoice} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Account Types</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.8}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title & Subtitle */}
        <View style={styles.headingSection}>
          <View style={styles.titleRow}>
            <View style={styles.miniLogoBadge}>
              <Text style={styles.miniLogoIcon}>📅</Text>
            </View>
            <Text style={styles.pageTitle}>Client Profile Onboarding</Text>
          </View>
          <Text style={styles.pageSubtitle}>
            Create your account to discover creators, view available slots, and book instant consultations.
          </Text>
        </View>

        {/* Error Alert Banner */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* SECTION 1: ACCOUNT CREDENTIALS */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.numBadgeIndigo}>
                <Text style={styles.numBadgeIndigoText}>1. ACCOUNT</Text>
              </View>
              <Text style={styles.cardHeaderTitle}>ACCOUNT CREDENTIALS</Text>
            </View>

            <View style={styles.securedBadge}>
              <View style={styles.securedDot} />
              <Text style={styles.securedText}>Secured</Text>
            </View>
          </View>

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Full Name <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.fieldIcon}>👤</Text>
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                placeholderTextColor={colors.textDim}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          {/* Email Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Email Address <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.fieldIcon}>✉️</Text>
              <TextInput
                style={styles.textInput}
                placeholder="client@example.com"
                placeholderTextColor={colors.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Password <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.fieldIcon}>🔒</Text>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="••••••••••••"
                placeholderTextColor={colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeToggleBtn}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIconText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION 2: CLIENT PREFERENCES */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.numBadgeSky}>
                <Text style={styles.numBadgeSkyText}>2. PREFERENCES</Text>
              </View>
              <Text style={styles.cardHeaderTitle}>BOOKING PREFERENCES</Text>
            </View>
          </View>

          {/* Preferred Interest Categories */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Primary Service Interest</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.categoryPillsRow}
            >
              {INTEREST_CATEGORIES.map((cat) => {
                const isActive = preferredCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catPill,
                      isActive && styles.catPillActive
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setPreferredCategory(cat)}
                  >
                    {isActive && <Text style={styles.catCheckMark}>✓</Text>}
                    <Text style={[
                      styles.catPillText,
                      isActive && styles.catPillTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Additional Booking Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Booking Preferences / Special Notes (Optional)</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="E.g. Morning appointment preferences, specific consultation topics..."
                placeholderTextColor={colors.textDim}
                value={clientNotes}
                onChangeText={setClientNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.floatingBottomBar}>
        <TouchableOpacity
          style={[styles.launchButton, loading && styles.launchButtonDisabled]}
          activeOpacity={0.88}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={styles.launchButtonText}>Create Client Account</Text>
              <Text style={styles.launchArrow}>→</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Progress Subtext */}
        <View style={styles.progressInfoRow}>
          <Text style={styles.progressText}>Step 1 of 1</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.progressText}>Instant Setup</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.previewCardLink}>Secure Encryption</Text>
        </View>

        {/* iOS Home Indicator */}
        <View style={styles.bottomHomeBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    height: Platform.OS === 'ios' ? 88 : 56,
    paddingTop: Platform.OS === 'ios' ? 44 : 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    marginTop: -2,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 16,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  headingSection: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  miniLogoBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoIcon: {
    fontSize: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
    paddingLeft: 32,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: radii.md,
    padding: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  cardSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numBadgeIndigo: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  numBadgeIndigoText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  numBadgeSky: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  numBadgeSkyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284c7',
  },
  cardHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: 0.6,
  },
  securedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  securedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  securedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  asterisk: {
    color: '#f43f5e',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  fieldIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
    color: colors.textMain,
  },
  eyeToggleBtn: {
    padding: 6,
  },
  eyeIconText: {
    fontSize: 16,
  },
  categoryPillsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  catPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catCheckMark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    marginRight: 4,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textAreaContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 10,
  },
  textAreaInput: {
    height: 70,
    fontSize: 13,
    color: colors.textMain,
    textAlignVertical: 'top',
    lineHeight: 18,
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 30,
  },
  launchButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  launchButtonDisabled: {
    opacity: 0.6,
  },
  launchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  launchArrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  progressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDim,
  },
  dotSeparator: {
    fontSize: 11,
    color: colors.textDim,
  },
  previewCardLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomHomeBar: {
    width: 120,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    opacity: 0.6,
  },
});
