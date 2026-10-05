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
  Modal,
  Platform
} from 'react-native';
import { colors, radii, shadows } from '../../theme/colors';
import { getCreatorAvailabilityRules, addAvailabilityRule, deleteAvailabilityRule } from '../../services/api';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Sparkles, 
  Check, 
  X 
} from '../../components/LucideIcons';
import AppBackground from '../../components/AppBackground';

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
    <AppBackground variant="violet" style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity 
            style={styles.backButtonCircle} 
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronLeft size={20} color={colors.accentViolet} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Weekly Schedule Rules</Text>
            <Text style={styles.subtitle}>Automated slot generation & working hours</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => setModalVisible(true)} 
            activeOpacity={0.85}
          >
            <Plus size={15} color="#ffffff" strokeWidth={2.8} />
            <Text style={styles.addBtnText}>Add Rule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.accentViolet} />
          <Text style={styles.loadingText}>Fetching schedule rules...</Text>
        </View>
      ) : rules.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Clock size={36} color={colors.accentViolet} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>No schedule rules configured</Text>
          <Text style={styles.emptySubtitle}>
            Add recurring weekly working hours (e.g. Monday 09:00 to 17:00) to open client booking slots.
          </Text>
          <TouchableOpacity 
            style={styles.createFirstBtn} 
            onPress={() => setModalVisible(true)} 
            activeOpacity={0.88}
          >
            <Plus size={16} color="#ffffff" strokeWidth={2.8} />
            <Text style={styles.createFirstBtnText}>Add Availability Rule</Text>
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
                      {rule.start_time} - {rule.end_time} ({slotDuration}m slots)
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDeleteRule(rule.id, dayName)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={16} color={colors.danger} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Availability Scheduling Bottom Sheet Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetCard}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Add Availability Rule</Text>
                <Text style={styles.sheetSubtitle}>Specify active working hours (24h format)</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeSheetBtn} 
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={16} color={colors.textDim} strokeWidth={2.5} />
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
                  <Clock size={16} color={colors.textDim} />
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
                  <Clock size={16} color={colors.textDim} />
                </View>
              </View>
            </View>

            {/* Slot Auto-generation Preview Badge */}
            <View style={styles.previewBadge}>
              <Sparkles size={16} color={colors.accentViolet} strokeWidth={2.2} />
              <Text style={styles.previewBadgeText}>
                Generates <Text style={styles.previewHighlight}>{estimatedSlots} slots</Text> ({slotDuration}m duration) on this day
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
                    <Check size={16} color="#ffffff" strokeWidth={2.8} />
                    <Text style={styles.saveModalBtnText}>Save Schedule</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  header: {
    paddingHorizontal: 22,
    marginBottom: 16,
    gap: 8,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    marginBottom: 4,
    ...shadows.subtle,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.textDim,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: colors.accentViolet,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.md,
    ...shadows.violetGlow,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  rulesList: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 12,
  },
  ruleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: radii.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    ...shadows.card,
  },
  ruleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayTag: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.accentPurpleWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTagText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.accentViolet,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
  },
  timeRangeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textDim,
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    padding: 10,
    borderRadius: radii.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.accentPurpleWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 13.5,
    color: colors.textMuted,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  createFirstBtn: {
    backgroundColor: colors.accentViolet,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radii.md,
    ...shadows.violetGlow,
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    width: '100%',
    gap: 16,
    ...shadows.modal,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderDark,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.textHeading,
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 12.5,
    color: colors.textDim,
    marginTop: 2,
  },
  closeSheetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
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
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderWidth: 1,
    borderColor: colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayGridBtnSelected: {
    backgroundColor: colors.accentViolet,
    borderColor: colors.accentViolet,
    ...shadows.violetGlow,
  },
  dayGridText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dayGridTextSelected: {
    color: '#ffffff',
    fontWeight: '900',
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 48,
  },
  timeInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.textMain,
  },
  previewBadge: {
    backgroundColor: colors.accentPurpleWash,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
    borderRadius: radii.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accentViolet,
    flex: 1,
  },
  previewHighlight: {
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    paddingVertical: 13,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  cancelModalBtnText: {
    color: colors.textMuted,
    fontSize: 13.5,
    fontWeight: '700',
  },
  saveModalBtn: {
    flex: 2,
    backgroundColor: colors.accentViolet,
    paddingVertical: 13,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.violetGlow,
  },
  saveModalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});
