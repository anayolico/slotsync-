import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { registerUser, loginUser } from '../../services/api';

interface Props {
  onRegisterSuccess: () => void;
  onBackToChoice: () => void;
}

const CATEGORIES = ['General', 'Doctor', 'Lawyer', 'Barber', 'Consultant', 'Fitness', 'Beauty', 'Tutor'];
const SLOT_DURATIONS = [15, 30, 45, 60];

export default function RegisterCreatorScreen({ onRegisterSuccess, onBackToChoice }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('General');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('50');
  const [slotDuration, setSlotDuration] = useState(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in required fields (Name, Email, Password).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role: 'CREATOR',
        category,
        title: title.trim() || `${fullName.trim()}'s Service`,
        bio: bio.trim() || 'Welcome to my SlotSync calendar! Select a time slot below to book.',
        hourly_rate: parseFloat(hourlyRate) || 0.0,
        slot_duration_minutes: slotDuration,
      });

      // Auto login after creator registration
      await loginUser(email.trim(), password);
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create creator profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={onBackToChoice}>
        <Text style={styles.backButtonText}>← Back to Account Types</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Creator Profile Onboarding</Text>
        <Text style={styles.subtitle}>Set up your service catalog & availability schedule</Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.sectionHeader}>Account Credentials</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Dr. Jane Smith"
            placeholderTextColor={colors.textDim}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="creator@example.com"
            placeholderTextColor={colors.textDim}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionHeader}>Creator Profile Details</Text>

        {/* Category Pills Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Professional Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, category === cat && styles.pillActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Professional Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Senior Consultant / Master Barber"
            placeholderTextColor={colors.textDim}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hourly Consultation Rate ($/hr)</Text>
          <TextInput
            style={styles.input}
            placeholder="50"
            placeholderTextColor={colors.textDim}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
          />
        </View>

        {/* Slot Duration Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Default Slot Duration (Minutes)</Text>
          <View style={styles.durationsRow}>
            {SLOT_DURATIONS.map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[styles.durationChip, slotDuration === dur && styles.durationChipActive]}
                onPress={() => setSlotDuration(dur)}
              >
                <Text style={[styles.durationChipText, slotDuration === dur && styles.durationChipTextActive]}>
                  {dur} mins
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Profile Bio / Introduction</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell clients about your services..."
            placeholderTextColor={colors.textDim}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Launch Creator Profile</Text>
          )}
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: 'rgba(239,68,68,0.3)',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
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
    gap: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textMain,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pillsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    backgroundColor: colors.bgInput,
    borderColor: colors.borderColor,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  pillActive: {
    backgroundColor: colors.accentCyan,
    borderColor: colors.accentCyan,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  pillTextActive: {
    color: '#ffffff',
  },
  durationsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderColor: colors.borderColor,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  durationChipTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
