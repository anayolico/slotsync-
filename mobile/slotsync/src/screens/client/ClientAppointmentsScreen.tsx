import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  Alert,
  Image,
  Platform
} from 'react-native';
import { colors, radii, shadows } from '../../theme/colors';
import { getMyAppointments, updateAppointmentStatus } from '../../services/api';
import { Calendar, Clock, Sparkles, CheckCircle2, AlertCircle, XCircle } from '../../components/LucideIcons';
import AppBackground from '../../components/AppBackground';

const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

export default function ClientAppointmentsScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Fetch appointments error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleCancelAppointment = (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this appointment session?',
      [
        { text: 'No, Keep Slot', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await updateAppointmentStatus(id, 'CANCELLED');
              fetchAppointments();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel appointment.');
            }
          }
        }
      ]
    );
  };

  const filteredAppointments = appointments.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return (item.status || 'PENDING') === statusFilter;
  });

  const renderBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    let bg = colors.warningBg;
    let text = colors.warning;
    let border = colors.warningBorder;
    let label = 'PENDING';

    if (s === 'CONFIRMED') {
      bg = colors.successBg;
      text = colors.success;
      border = colors.successBorder;
      label = 'CONFIRMED';
    } else if (s === 'COMPLETED') {
      bg = colors.infoBg;
      text = colors.info;
      border = colors.infoBorder;
      label = 'COMPLETED';
    } else if (s === 'REJECTED' || s === 'CANCELLED') {
      bg = colors.dangerBg;
      text = colors.danger;
      border = colors.dangerBorder;
      label = s === 'REJECTED' ? 'DECLINED' : 'CANCELLED';
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
        <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const creatorName = item.creator?.user?.full_name || item.creator?.title || 'Specialist Consultant';
    const creatorRole = item.creator?.title || item.creator?.category || 'Professional Specialist';
    const avatarUrl = item.creator?.user?.avatar_url;
    const initials = creatorName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'SP';

    const dt = item.start_time_utc ? new Date(item.start_time_utc) : null;
    const dateFormatted = dt
      ? dt.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'N/A';
    const timeFormatted = dt
      ? dt.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

    const isPending = item.status === 'PENDING';
    const isConfirmed = item.status === 'CONFIRMED';
    const canCancel = isPending || isConfirmed;

    return (
      <View style={styles.appointmentCard}>
        {/* Card Header: Avatar, Name, Title, and Status Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarPhoto} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{initials}</Text>
              </View>
            )}
          </View>

          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName} numberOfLines={1}>{creatorName}</Text>
            <Text style={styles.creatorTitle} numberOfLines={1}>{creatorRole}</Text>
            <View style={styles.bookingIdRow}>
              <Text style={styles.bookingIdText}>REF #{String(item.id || '').substring(0, 8).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.badgeWrapper}>
            {renderBadge(item.status)}
          </View>
        </View>

        {/* Schedule Info Box */}
        <View style={styles.scheduleBox}>
          <View style={styles.scheduleItem}>
            <Calendar size={15} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.scheduleDateText}>{dateFormatted}</Text>
          </View>
          <View style={styles.scheduleDivider} />
          <View style={styles.scheduleItem}>
            <Clock size={15} color={colors.textDim} strokeWidth={2.2} />
            <Text style={styles.scheduleTimeText}>{timeFormatted}</Text>
          </View>
        </View>

        {/* Client Notes if any */}
        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Your Consultation Note:</Text>
            <Text style={styles.notesText}>"{item.notes}"</Text>
          </View>
        ) : null}

        {/* Action Controls */}
        {canCancel && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelAppointment(item.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.cancelButtonText}>
                {isPending ? 'Cancel Request' : 'Cancel Booking'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <AppBackground variant="indigo" style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Track your upcoming sessions and consultation history</Text>
      </View>

      {/* Status Filter Horizontal Tabs */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = statusFilter === item;
            return (
              <TouchableOpacity
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setStatusFilter(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your appointments...</Text>
        </View>
      ) : filteredAppointments.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Calendar size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No appointments found</Text>
          <Text style={styles.emptySubtitle}>You don't have any bookings matching this status filter.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  topHeader: {
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#3730A3',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textDim,
    marginTop: 3,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterList: {
    paddingHorizontal: 22,
    gap: 8,
  },
  filterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(226, 232, 240, 0.95)',
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.pill,
    ...shadows.subtle,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.primaryGlow,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 14,
  },
  appointmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: radii.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    ...shadows.card,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarPhoto: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.bgSubtle,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
    letterSpacing: -0.2,
  },
  creatorTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textDim,
    marginTop: 1,
  },
  bookingIdRow: {
    marginTop: 2,
  },
  bookingIdText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scheduleBox: {
    backgroundColor: colors.primaryWash,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  scheduleDateText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.textMain,
  },
  scheduleTimeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  notesBox: {
    backgroundColor: colors.warningBg,
    borderRadius: radii.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.warningDark,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12.5,
    color: '#78350F',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.danger,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryWash,
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
    fontSize: 17,
    fontWeight: '800',
    color: colors.textMain,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
});
