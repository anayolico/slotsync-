import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  Modal 
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { getCreatorAvailabilityRules, addAvailabilityRule, deleteAvailabilityRule } from '../../services/api';

interface Props {
  currentUser: any;
  onBack?: () => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ManageAvailabilityScreen({ currentUser, onBack }: Props) {
  const creatorProfile = currentUser?.creator_profile;
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [submitting, setSubmitting] = useState(false);

  const fetchRules = async () => {
    if (!creatorProfile?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await getCreatorAvailabilityRules(creatorProfile.id);
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Fetch rules error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [creatorProfile]);

  const handleAddRule = async () => {
    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert('Validation Error', 'Please specify both start and end times (HH:MM).');
      return;
    }

    setSubmitting(true);
    try {
      await addAvailabilityRule(selectedDay, startTime.trim(), endTime.trim(), rules);
      setModalVisible(false);
      fetchRules();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not add availability rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = (ruleId: string, dayName: string) => {
    Alert.alert(
      'Delete Rule',
      `Are you sure you want to remove availability for ${dayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAvailabilityRule(ruleId);
              fetchRules();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete rule.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Weekly Schedule Rules</Text>
            <Text style={styles.subtitle}>Configure working hours for automated slot generation</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Add Rule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching schedule rules...</Text>
        </View>
      ) : rules.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>⏰</Text>
          <Text style={styles.emptyTitle}>No availability rules configured</Text>
          <Text style={styles.emptySubtitle}>
            Add weekly working hours (e.g. Monday 09:00 to 17:00) to open client booking slots.
          </Text>
          <TouchableOpacity style={styles.createFirstBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.createFirstBtnText}>+ Set Up Working Hours</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.rulesList}>
          {rules.map((rule) => {
            const dayName = WEEKDAYS[rule.day_of_week] || `Day ${rule.day_of_week}`;
            return (
              <View key={rule.id || Math.random()} style={styles.ruleCard}>
                <View style={styles.ruleLeft}>
                  <Text style={styles.dayTitle}>{dayName}</Text>
                  <Text style={styles.timeRangeText}>
                    🕒 {rule.start_time} → {rule.end_time}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDeleteRule(rule.id, dayName)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add Rule Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Availability Rule</Text>
            <Text style={styles.modalSubtitle}>Specify working day & active hours (24h format)</Text>

            {/* Day Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Day of Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
                {WEEKDAYS.map((d, index) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayChip, selectedDay === index && styles.dayChipSelected]}
                    onPress={() => setSelectedDay(index)}
                  >
                    <Text style={[styles.dayChipText, selectedDay === index && styles.dayChipTextSelected]}>
                      {d.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Start & End Time Inputs */}
            <View style={styles.timeInputsRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start Time (HH:MM)</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="09:00"
                  placeholderTextColor={colors.textDim}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>End Time (HH:MM)</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="17:00"
                  placeholderTextColor={colors.textDim}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelModalBtn} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveModalBtn, submitting && styles.buttonDisabled]} 
                onPress={handleAddRule}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveModalBtnText}>Save Schedule</Text>
                )}
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
    flex: 1,
    backgroundColor: colors.bgApp,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  backBtn: {
    marginBottom: 4,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  rulesList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  ruleCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  ruleLeft: {
    gap: 4,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  timeRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  deleteBtn: {
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  createFirstBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  createFirstBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.xl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -10,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  daysRow: {
    gap: 6,
    paddingVertical: 4,
  },
  dayChip: {
    backgroundColor: colors.bgInput,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dayChipTextSelected: {
    color: '#ffffff',
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textMain,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: colors.bgInput,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  cancelModalBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  saveModalBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  saveModalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
