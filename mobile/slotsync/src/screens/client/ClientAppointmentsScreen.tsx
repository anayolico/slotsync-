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
  Image
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { getMyAppointments, updateAppointmentStatus } from '../../services/api';
import { Calendar, Clock } from '../../components/LucideIcons';

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
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
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
    let bg = '#fff7ed';
    let text = '#ea580c';
    let label = 'AWAITING APPROVAL';

    if (s === 'CONFIRMED') {
      bg = '#ecfdf5';
      text = '#059669';
      label = 'CONFIRMED';
    } else if (s === 'COMPLETED') {
      bg = '#eff6ff';
      text = '#2563eb';
      label = 'COMPLETED';
    } else if (s === 'REJECTED') {
      bg = '#fef2f2';
      text = '#dc2626';
      label = 'DECLINED';
    } else if (s === 'CANCELLED') {
      bg = '#fef2f2';
      text = '#dc2626';
      label = 'CANCELLED';
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: text, fontWeight: '700' }]}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const creatorName = item.creator?.user?.full_name || item.creator?.title || 'Specialist Consultant';
    const creatorRole = item.creator?.title || item.creator?.category || 'Professional';
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
      <View style={styles.card}>
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
              <Text style={styles.bookingIdText}>REF: #{(item.id || '').substring(0, 8).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.badgeWrapper}>
            {renderBadge(item.status)}
          </View>
        </View>

        {/* Schedule Info Box */}
        <View style={styles.scheduleBox}>
          <View style={styles.scheduleItem}>
            <Calendar size={15} color={colors.primary} />
            <Text style={styles.scheduleDateText}>{dateFormatted}</Text>
          </View>
          <View style={styles.scheduleDivider} />
          <View style={styles.scheduleItem}>
            <Clock size={15} color="#64748b" />
            <Text style={styles.scheduleTimeText}>{timeFormatted} (UTC)</Text>
          </View>
        </View>

        {/* Client Notes if any */}
        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Your Note:</Text>
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
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>My Appointments</Text>
        <Text style={styles.subtitle}>Track your booked consultations and schedules</Text>
      </View>

      {/* Filter Row */}
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
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No appointments found</Text>
          <Text style={styles.emptySubtitle}>You don't have any bookings matching this status.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
    paddingTop: 50,
  },
  topHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  filterSection: {
    marginBottom: 14,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderColor,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
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
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  creatorTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  bookingIdRow: {
    marginTop: 3,
  },
  bookingIdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.4,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  scheduleBox: {
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
    backgroundColor: '#e2e8f0',
  },
  scheduleDateText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e293b',
  },
  scheduleTimeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  notesBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#78350f',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
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
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
