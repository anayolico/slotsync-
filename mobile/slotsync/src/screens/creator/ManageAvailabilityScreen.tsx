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

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ManageAvailabilityScreen({ currentUser, onBack }: Props) {
  const creatorProfile = currentUser?.creator_profile;
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Mon
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [submitting, setSubmitting] = useState(false);

  const slotDuration = creatorProfile?.slot_duration_minutes || 30;

  const fetchRules = async () => {
    try {
      const data = await getCreatorAvailabilityRules(creatorProfile?.id);
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
              await deleteAvailabilityRule(ruleId, rules);
              fetchRules();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete rule.');
            }
          }
        }
      ]
    );
  };

  // Calculate estimated slots
  const calculateSlotCount = () => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const startTotal = (sh || 0) * 60 + (sm || 0);
      const endTotal = (eh || 0) * 60 + (em || 0);
      if (endTotal > startTotal) {
        return Math.floor((endTotal - startTotal) / slotDuration);
      }
    } catch {
      return 16;
    }
    return 16;
  };

  const estimatedSlots = calculateSlotCount();

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>‹ Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Weekly Schedule Rules</Text>
            <Text style={styles.subtitle}>Automated slot generation & active hours</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
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
          <TouchableOpacity style={styles.createFirstBtn} onPress={() => setModalVisible(true)} activeOpacity={0.88}>
            <Text style={styles.createFirstBtnText}>+ Add Availability Rule</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.rulesList} showsVerticalScrollIndicator={false}>
          {rules.map((rule) => {
            const dayName = WEEKDAYS[rule.day_of_week] || `Day ${rule.day_of_week}`;
            return (
              <View key={rule.id || Math.random()} style={styles.ruleCard}>
                <View style={styles.ruleLeft}>
                  <View style={styles.dayTag}>
                    <Text style={styles.dayTagText}>{dayName}</Text>
                  </View>
                  <View>
                    <Text style={styles.dayTitle}>{dayName} Working Hours</Text>
                    <Text style={styles.timeRangeText}>
                      🕒 {rule.start_time} - {rule.end_time} ({slotDuration} min slots)
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDeleteRule(rule.id, dayName)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Availability Scheduling Bottom Sheet Modal (Stitch Screen 4 Spec) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetCard}>
            {/* Sheet Drag Handle Indicator */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Add Availability Rule</Text>
                <Text style={styles.sheetSubtitle}>Specify working day & active hours (24h format)</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeSheetBtn} 
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeSheetText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Days of Week Selector 7-Grid */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SELECT DAY OF WEEK</Text>
              <View style={styles.daysGrid}>
                {WEEKDAYS.map((d, index) => {
                  const isSelected = selectedDay === index;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayGridBtn, isSelected && styles.dayGridBtnSelected]}
                      onPress={() => setSelectedDay(index)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dayGridText, isSelected && styles.dayGridTextSelected]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Start & End Time Inputs Row */}
            <View style={styles.timeInputsRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>START TIME (HH:MM)</Text>
                <View style={styles.timeInputBox}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="09:00"
                    placeholderTextColor={colors.textDim}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                  <Text style={styles.clockInputIcon}>🕒</Text>
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>END TIME (HH:MM)</Text>
                <View style={styles.timeInputBox}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="17:00"
                    placeholderTextColor={colors.textDim}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                  <Text style={styles.clockInputIcon}>🕒</Text>
                </View>
              </View>
            </View>

            {/* Slot Auto-generation Preview Badge */}
            <View style={styles.previewBadge}>
              <Text style={styles.lightningIcon}>⚡</Text>
              <Text style={styles.previewBadgeText}>
                Will generate <Text style={styles.previewHighlight}>{estimatedSlots} slots</Text> ({slotDuration}-min duration) per active day
              </Text>
            </View>

            {/* Modal Action Buttons Row */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelModalBtn} 
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveModalBtn, submitting && styles.buttonDisabled]} 
                onPress={handleAddRule}
                disabled={submitting}
                activeOpacity={0.88}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.saveCheckIcon}>✓</Text>
                    <Text style={styles.saveModalBtnText}>Save Schedule</Text>
                  </>
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
    paddingTop: 48,
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
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -0.3,
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
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  rulesList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  ruleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  ruleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayTag: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTagText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  dayTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textMain,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deleteBtnText: {
    color: '#e11d48',
    fontSize: 11.5,
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
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  createFirstBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 32,
    width: '100%',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 40,
    elevation: 10,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeSheetBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSheetText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
  },
  daysGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  dayGridBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayGridBtnSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayGridText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  dayGridTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  timeInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  clockInputIcon: {
    fontSize: 14,
  },
  previewBadge: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lightningIcon: {
    fontSize: 16,
  },
  previewBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.primaryDark,
    flex: 1,
  },
  previewHighlight: {
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalBtnText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  saveModalBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveCheckIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  saveModalBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

