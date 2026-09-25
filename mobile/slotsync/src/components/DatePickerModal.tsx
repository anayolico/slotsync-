import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, radii } from '../theme/colors';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from './LucideIcons';

interface DatePickerModalProps {
  visible: boolean;
  value?: string; // Format: YYYY-MM-DD
  onSelect: (dateString: string) => void;
  onClose: () => void;
  title?: string;
  maxDate?: Date; // Defaults to current date for Date of Birth
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_HEADER = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePickerModal({
  visible,
  value,
  onSelect,
  onClose,
  title = 'Select Date of Birth',
  maxDate = new Date(),
}: DatePickerModalProps) {
  // Parse existing date or default to 20 years ago (good UX for Date of Birth)
  const defaultYear = new Date().getFullYear() - 22;
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'YEAR_SELECT'>('CALENDAR');

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0-11
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Sync state when modal opens or value changes
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parts = value.split('-').map(Number);
      setSelectedYear(parts[0]);
      setSelectedMonth(parts[1] - 1);
      setSelectedDay(parts[2]);
    } else {
      const today = new Date();
      setSelectedYear(defaultYear);
      setSelectedMonth(today.getMonth());
      setSelectedDay(today.getDate());
    }
    setViewMode('CALENDAR');
  }, [visible, value]);

  // Generate Year Range (from 1940 to maxDate year)
  const maxYear = maxDate.getFullYear();
  const yearsList: number[] = [];
  for (let y = maxYear; y >= 1940; y--) {
    yearsList.push(y);
  }

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedYear === maxYear && selectedMonth >= maxDate.getMonth()) {
      return; // Cannot go past max date month
    }
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Days in month calculation
  const daysInCurrentMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 is Sunday

  const handleSelectDay = (day: number) => {
    const candidateDate = new Date(selectedYear, selectedMonth, day);
    if (candidateDate > maxDate) return;
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    const mStr = String(selectedMonth + 1).padStart(2, '0');
    const dStr = String(selectedDay).padStart(2, '0');
    const formatted = `${selectedYear}-${mStr}-${dStr}`;
    onSelect(formatted);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.cardContainer}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleWrap}>
                  <CalendarIcon size={20} color={colors.primary} />
                  <Text style={styles.headerTitleText}>{title}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Month & Year Navigation Bar */}
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={styles.navArrowBtn}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={20} color="#1e293b" />
                </TouchableOpacity>

                <View style={styles.monthYearSelector}>
                  <Text style={styles.monthText}>{MONTH_NAMES[selectedMonth]}</Text>
                  <TouchableOpacity
                    style={[
                      styles.yearPill,
                      viewMode === 'YEAR_SELECT' && styles.yearPillActive,
                    ]}
                    onPress={() =>
                      setViewMode(viewMode === 'YEAR_SELECT' ? 'CALENDAR' : 'YEAR_SELECT')
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        viewMode === 'YEAR_SELECT' && styles.yearTextActive,
                      ]}
                    >
                      {selectedYear} ▾
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={[
                    styles.navArrowBtn,
                    selectedYear === maxYear && selectedMonth >= maxDate.getMonth() && styles.disabledNavArrow,
                  ]}
                  activeOpacity={0.7}
                  disabled={selectedYear === maxYear && selectedMonth >= maxDate.getMonth()}
                >
                  <ChevronRight
                    size={20}
                    color={selectedYear === maxYear && selectedMonth >= maxDate.getMonth() ? '#cbd5e1' : '#1e293b'}
                  />
                </TouchableOpacity>
              </View>

              {/* View Mode 1: Year Selector Grid */}
              {viewMode === 'YEAR_SELECT' ? (
                <View style={styles.yearGridContainer}>
                  <Text style={styles.yearGridPrompt}>Tap a year to select</Text>
                  <ScrollView
                    style={styles.yearScrollView}
                    contentContainerStyle={styles.yearScrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    {yearsList.map((y) => {
                      const isSel = y === selectedYear;
                      return (
                        <TouchableOpacity
                          key={y}
                          style={[styles.yearItemBtn, isSel && styles.yearItemBtnActive]}
                          onPress={() => {
                            setSelectedYear(y);
                            setViewMode('CALENDAR');
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.yearItemText,
                              isSel && styles.yearItemTextActive,
                            ]}
                          >
                            {y}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : (
                /* View Mode 2: Month Days Calendar Grid */
                <View style={styles.calendarContainer}>
                  {/* Days of week header */}
                  <View style={styles.weekdaysRow}>
                    {DAYS_HEADER.map((d, idx) => (
                      <Text key={idx} style={styles.weekdayHeaderText}>
                        {d}
                      </Text>
                    ))}
                  </View>

                  {/* Grid cells */}
                  <View style={styles.daysGrid}>
                    {/* Empty offset spaces */}
                    {Array.from({ length: firstDayWeekday }).map((_, idx) => (
                      <View key={`empty-${idx}`} style={styles.dayCellEmpty} />
                    ))}

                    {/* Day numbers */}
                    {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const isSelected =
                        selectedDay === dayNumber &&
                        selectedMonth === selectedMonth &&
                        selectedYear === selectedYear;

                      const isFuture =
                        new Date(selectedYear, selectedMonth, dayNumber) > maxDate;

                      return (
                        <TouchableOpacity
                          key={`day-${dayNumber}`}
                          style={[
                            styles.dayCell,
                            isSelected && styles.dayCellSelected,
                            isFuture && styles.dayCellDisabled,
                          ]}
                          onPress={() => handleSelectDay(dayNumber)}
                          disabled={isFuture}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dayNumberText,
                              isSelected && styles.dayNumberTextSelected,
                              isFuture && styles.dayNumberTextDisabled,
                            ]}
                          >
                            {dayNumber}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Selected Date Summary & Actions */}
              <View style={styles.footerRow}>
                <View style={styles.datePreviewBox}>
                  <Text style={styles.datePreviewLabel}>Selected Date</Text>
                  <Text style={styles.datePreviewValue}>
                    {selectedYear}-{String(selectedMonth + 1).padStart(2, '0')}-{String(selectedDay).padStart(2, '0')}
                  </Text>
                </View>

                <View style={styles.actionBtnsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                  >
                    <Check size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmBtnText}>Set Date</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  navArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledNavArrow: {
    opacity: 0.4,
  },
  monthYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  yearPill: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  yearPillActive: {
    backgroundColor: colors.primary,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  yearTextActive: {
    color: '#ffffff',
  },
  calendarContainer: {
    marginTop: 4,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  weekdayHeaderText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 40,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  dayNumberTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dayNumberTextDisabled: {
    color: '#cbd5e1',
  },
  yearGridContainer: {
    height: 240,
    paddingVertical: 8,
  },
  yearGridPrompt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  yearScrollView: {
    flex: 1,
  },
  yearScrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingBottom: 16,
  },
  yearItemBtn: {
    width: '22%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  yearItemBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  yearItemTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  footerRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePreviewBox: {
    flex: 1,
  },
  datePreviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  datePreviewValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  actionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
