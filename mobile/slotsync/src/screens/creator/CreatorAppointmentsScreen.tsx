import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { getCreatorAppointments, updateAppointmentStatus } from '../../services/api';

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function CreatorAppointmentsScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await getCreatorAppointments();
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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      fetchAppointments();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status.');
    }
  };

  const filteredAppointments = appointments.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return (item.status || 'PENDING') === statusFilter;
  });

  const renderBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    let bg = colors.warningBg;
    let text = colors.warning;

    if (s === 'CONFIRMED' || s === 'COMPLETED') {
      bg = colors.successBg;
      text = colors.success;
    } else if (s === 'CANCELLED' || s === 'REJECTED') {
      bg = colors.dangerBg;
      text = colors.danger;
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: text }]}>{s}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const clientName = item.client ? item.client.full_name : 'Client User';
    const clientEmail = item.client ? item.client.email : 'N/A';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{clientName}</Text>
            <Text style={styles.clientEmail}>{clientEmail}</Text>
          </View>
          {renderBadge(item.status)}
        </View>

        <View style={styles.timeBox}>
          <Text style={styles.timeLabel}>BOOKED TIME SLOT (UTC)</Text>
          <Text style={styles.timeValue}>
            {item.start_time_utc ? new Date(item.start_time_utc).toUTCString() : 'N/A'}
          </Text>
        </View>

        {item.notes ? (
          <Text style={styles.notesText}>Client Note: "{item.notes}"</Text>
        ) : null}

        {/* Action Controls */}
        <View style={styles.actionRow}>
          {item.status !== 'CONFIRMED' && item.status !== 'COMPLETED' && (
            <TouchableOpacity 
              style={styles.confirmActionBtn} 
              onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
            >
              <Text style={styles.confirmActionText}>✓ Confirm</Text>
            </TouchableOpacity>
          )}

          {item.status === 'CONFIRMED' && (
            <TouchableOpacity 
              style={styles.completeActionBtn} 
              onPress={() => handleUpdateStatus(item.id, 'COMPLETED')}
            >
              <Text style={styles.completeActionText}>🎉 Mark Complete</Text>
            </TouchableOpacity>
          )}

          {item.status !== 'CANCELLED' && item.status !== 'REJECTED' && item.status !== 'COMPLETED' && (
            <TouchableOpacity 
              style={styles.cancelActionBtn} 
              onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
            >
              <Text style={styles.cancelActionText}>✕ Reject / Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Client Booking Requests</Text>
        <Text style={styles.subtitle}>Review and manage incoming consultation requests</Text>
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
          <Text style={styles.loadingText}>Fetching booking requests...</Text>
        </View>
      ) : filteredAppointments.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyEmoji}>📬</Text>
          <Text style={styles.emptyTitle}>No client requests found</Text>
          <Text style={styles.emptySubtitle}>No appointments match the selected filter status.</Text>
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
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  clientEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeBox: {
    backgroundColor: colors.bgInput,
    padding: 10,
    borderRadius: radii.md,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textDim,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 2,
  },
  notesText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  confirmActionBtn: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  confirmActionText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  completeActionBtn: {
    backgroundColor: colors.subtleBg,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  completeActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  cancelActionBtn: {
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  cancelActionText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
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
