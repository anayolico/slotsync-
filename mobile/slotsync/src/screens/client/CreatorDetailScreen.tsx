import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { getAvailableSlots, createAppointment } from '../../services/api';

interface Props {
  creator: any;
  onBack: () => void;
  onBookingSuccess: () => void;
}

export default function CreatorDetailScreen({ creator, onBack, onBookingSuccess }: Props) {
  // Generate 7 upcoming dates (YYYY-MM-DD)
  const generateUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ iso, dayName, displayDate });
    }
    return dates;
  };

  const datesList = generateUpcomingDates();
  const [selectedDate, setSelectedDate] = useState(datesList[0].iso);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchSlots = async (date: string) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const data = await getAvailableSlots(creator.id, date);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Fetch slots error:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setBookingLoading(true);
    try {
      await createAppointment(creator.id, selectedSlot.start_time_utc, notes);
      Alert.alert(
        '🎉 Appointment Confirmed!',
        `Your slot with ${creator.title || 'Creator'} has been booked.`,
        [{ text: 'View My Appointments', onPress: onBookingSuccess }]
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Could not complete booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Navigation Top Bar */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back to Creators</Text>
      </TouchableOpacity>

      {/* Creator Hero Header Card */}
      <View style={styles.creatorHeroCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLetter}>
            {creator.title ? creator.title.charAt(0).toUpperCase() : 'C'}
          </Text>
        </View>
        <Text style={styles.creatorTitle}>{creator.title || 'Creator Profile'}</Text>
        <Text style={styles.creatorCategory}>{creator.category || 'General Service'}</Text>
        
        <Text style={styles.creatorBio}>{creator.bio || 'No bio provided for this creator.'}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaLabel}>HOURLY RATE</Text>
            <Text style={styles.metaValue}>${creator.hourly_rate || 0}/hr</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaLabel}>SLOT LENGTH</Text>
            <Text style={styles.metaValue}>{creator.slot_duration_minutes || 30} mins</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaLabel}>TIMEZONE</Text>
            <Text style={styles.metaValue}>{creator.timezone || 'UTC'}</Text>
          </View>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select Booking Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
          {datesList.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <TouchableOpacity
                key={item.iso}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => setSelectedDate(item.iso)}
              >
                <Text style={[styles.dayName, isSelected && styles.dateTextSelected]}>{item.dayName}</Text>
                <Text style={[styles.displayDate, isSelected && styles.dateTextSelected]}>{item.displayDate}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Time Slots Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Choose Available Time Slot</Text>

        {loadingSlots ? (
          <View style={styles.slotsLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Calculating available slots from backend...</Text>
          </View>
        ) : slots.length === 0 ? (
          <View style={styles.noSlotsBox}>
            <Text style={styles.noSlotsEmoji}>📅</Text>
            <Text style={styles.noSlotsTitle}>No slots available on this date</Text>
            <Text style={styles.noSlotsSubtitle}>Select another date above to view open consultation slots.</Text>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {slots.map((slot, index) => {
              const isSelected = selectedSlot?.start_time_utc === slot.start_time_utc;
              const formattedTime = new Date(slot.start_time_utc).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              });

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.slotChip, isSelected && styles.slotChipSelected]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotTimeText, isSelected && styles.slotTimeTextSelected]}>
                    {formattedTime}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Booking Form / Confirmation Button */}
      {selectedSlot && (
        <View style={styles.bookingCard}>
          <Text style={styles.sectionTitle}>3. Complete Booking</Text>
          
          <View style={styles.selectedSummary}>
            <Text style={styles.summaryLabel}>SELECTED SLOT</Text>
            <Text style={styles.summaryValue}>
              {new Date(selectedSlot.start_time_utc).toUTCString()}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.notesLabel}>Booking Notes for Creator (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g., Topic to discuss or consultation details..."
              placeholderTextColor={colors.textDim}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleConfirmBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm & Book Slot</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bgApp,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    gap: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  creatorHeroCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  creatorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  creatorCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentCyan,
    marginTop: 2,
    marginBottom: 10,
  },
  creatorBio: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  metaChip: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radii.md,
    padding: 8,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textDim,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  datesRow: {
    gap: 8,
    paddingVertical: 4,
  },
  dateCard: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  displayDate: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 2,
  },
  dateTextSelected: {
    color: '#ffffff',
  },
  slotsLoading: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  noSlotsBox: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  noSlotsEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  noSlotsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  noSlotsSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: '30%',
    alignItems: 'center',
  },
  slotChipSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  slotTimeTextSelected: {
    color: '#ffffff',
  },
  bookingCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderColor,
    gap: 12,
  },
  selectedSummary: {
    backgroundColor: colors.subtleBg,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 2,
  },
  inputGroup: {
    gap: 4,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  notesInput: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textMain,
    height: 60,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
