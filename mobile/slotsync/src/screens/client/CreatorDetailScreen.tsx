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
  Platform,
  Image
} from 'react-native';
import { colors, radii, shadows } from '../../theme/colors';
import { getAvailableSlots, createAppointment } from '../../services/api';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Check, 
  Star, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  ArrowRight
} from '../../components/LucideIcons';
import AppBackground from '../../components/AppBackground';

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
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
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
        `Your consultation session with ${creator.title || creator.user?.full_name || 'Creator'} has been booked.`,
        [{ text: 'View My Appointments', onPress: onBookingSuccess }]
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Could not complete booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const creatorName = creator.user?.full_name || creator.title || 'Specialist Creator';
  const creatorRole = creator.title || creator.category || 'Professional Specialist';
  const avatarUrl = creator.user?.avatar_url;
  const initials = creatorName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CR';

  return (
    <AppBackground variant="default" style={styles.outerWrapper}>
      {/* Top Floating Back Button */}
      <View style={styles.topNavigation}>
        <TouchableOpacity 
          style={styles.backButtonCircle} 
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={20} color={colors.textMain} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Book Session</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Creator Hero Header Card */}
        <View style={styles.creatorHeroCard}>
          <View style={styles.avatarLargeWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarLargePhoto} />
            ) : (
              <View style={styles.avatarLargeCircle}>
                <Text style={styles.avatarLargeLetter}>{initials}</Text>
              </View>
            )}
            <View style={styles.verifiedBadgeLarge}>
              <CheckCircle2 size={16} color="#ffffff" strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.creatorTitle}>{creatorName}</Text>
          <Text style={styles.creatorCategory}>{creatorRole}</Text>
          
          <View style={styles.ratingRow}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingValue}>4.9</Text>
            <Text style={styles.ratingCount}>(128 reviews)</Text>
            <View style={styles.dotSeparator} />
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{creator.category || 'General'}</Text>
            </View>
          </View>

          <Text style={styles.creatorBio}>
            {creator.bio || 'Available for professional consultation and schedule slot bookings on SlotSync.'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaLabel}>RATE</Text>
              <Text style={styles.metaValue}>₦{Number(creator.hourly_rate || 0).toLocaleString()}/hr</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaLabel}>DURATION</Text>
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
          <View style={styles.sectionHeaderRow}>
            <Calendar size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>1. Select Date</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
            {datesList.map((item) => {
              const isSelected = selectedDate === item.iso;
              return (
                <TouchableOpacity
                  key={item.iso}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                  onPress={() => setSelectedDate(item.iso)}
                  activeOpacity={0.8}
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
          <View style={styles.sectionHeaderRow}>
            <Clock size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>2. Choose Available Time Slot</Text>
          </View>

          {loadingSlots ? (
            <View style={styles.slotsLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Fetching available slots...</Text>
            </View>
          ) : slots.length === 0 ? (
            <View style={styles.noSlotsBox}>
              <Calendar size={28} color={colors.primaryLight} />
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
                    activeOpacity={0.8}
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
          <View style={styles.bookingGlassCard}>
            <View style={styles.sectionHeaderRow}>
              <Sparkles size={18} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.sectionTitle}>3. Complete Booking</Text>
            </View>
            
            <View style={styles.selectedSummary}>
              <Text style={styles.summaryLabel}>SELECTED TIME SLOT</Text>
              <Text style={styles.summaryValue}>
                {new Date(selectedSlot.start_time_utc).toUTCString()}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.notesLabel}>Booking Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Specify consultation topic, questions, or goals..."
                placeholderTextColor={colors.textDim}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
              activeOpacity={0.88}
              onPress={handleConfirmBooking}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.confirmButtonText}>Confirm & Book Slot</Text>
                  <ArrowRight size={18} color="#ffffff" strokeWidth={2.4} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 8,
  },
  backButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    ...shadows.subtle,
  },
  topNavTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3730A3',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 18,
  },
  creatorHeroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: radii.xl,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    ...shadows.card,
  },
  avatarLargeWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarLargePhoto: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.bgSubtle,
  },
  avatarLargeCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeLetter: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  verifiedBadgeLarge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  creatorTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#3730A3',
    letterSpacing: -0.3,
  },
  creatorCategory: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.textMain,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textDim,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.borderDark,
    marginHorizontal: 4,
  },
  categoryPill: {
    backgroundColor: colors.primaryWash,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  categoryPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
  },
  creatorBio: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  metaChip: {
    flex: 1,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.textHeading,
    letterSpacing: -0.2,
  },
  datesRow: {
    gap: 10,
    paddingVertical: 4,
  },
  dateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: 'rgba(226, 232, 240, 0.95)',
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 76,
    ...shadows.subtle,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primaryGlow,
  },
  dayName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textDim,
  },
  displayDate: {
    fontSize: 13.5,
    fontWeight: '900',
    color: colors.textMain,
    marginTop: 2,
  },
  dateTextSelected: {
    color: '#ffffff',
  },
  slotsLoading: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: colors.textDim,
    marginTop: 6,
  },
  noSlotsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    gap: 6,
  },
  noSlotsTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 4,
  },
  noSlotsSubtitle: {
    fontSize: 12.5,
    color: colors.textDim,
    textAlign: 'center',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(226, 232, 240, 0.95)',
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexBasis: '31%',
    flexGrow: 1,
    alignItems: 'center',
    ...shadows.subtle,
  },
  slotChipSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    shadowColor: colors.success,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  slotTimeText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textMain,
  },
  slotTimeTextSelected: {
    color: '#ffffff',
  },
  bookingGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: radii.xl,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    gap: 14,
    ...shadows.card,
  },
  selectedSummary: {
    backgroundColor: colors.primaryWash,
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 2,
  },
  inputGroup: {
    gap: 6,
  },
  notesLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMain,
  },
  notesInput: {
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: colors.textMain,
    height: 70,
    textAlignVertical: 'top',
  },
  confirmButton: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.primaryGlow,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
