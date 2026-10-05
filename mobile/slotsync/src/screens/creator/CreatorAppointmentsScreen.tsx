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
  StatusBar
} from 'react-native';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  LayoutList, 
  Inbox, 
  ChevronRight,
  MessageSquareQuote
} from '../../components/LucideIcons';

import { colors, radii, chromatic, glass, shadows } from '../../theme/colors';
import { getCreatorAppointments, updateAppointmentStatus } from '../../services/api';
import AppBackground from '../../components/AppBackground';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All', icon: LayoutList },
  { id: 'PENDING', label: 'Pending', icon: Clock },
  { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
  { id: 'CANCELLED', label: 'Cancelled', icon: XCircle },
  { id: 'REJECTED', label: 'Declined', icon: AlertCircle }
];


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

  const getStatusConfig = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return {
          bg: chromatic.emerald.bg,
          border: chromatic.emerald.border,
          text: chromatic.emerald.primary,
          label: 'Confirmed',
          icon: CheckCircle2
        };
      case 'COMPLETED':
        return {
          bg: chromatic.teal.bg,
          border: chromatic.teal.border,
          text: chromatic.teal.primary,
          label: 'Completed',
          icon: CheckCircle2
        };

      case 'CANCELLED':
      case 'REJECTED':
        return {
          bg: chromatic.rose.bg,
          border: chromatic.rose.border,
          text: chromatic.rose.primary,
          label: s === 'REJECTED' ? 'Declined' : 'Cancelled',
          icon: XCircle
        };
      case 'PENDING':
      default:
        return {
          bg: chromatic.amber.bg,
          border: chromatic.amber.border,
          text: chromatic.amber.primary,
          label: 'Action Required',
          icon: Clock
        };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const clientName = item.client ? item.client.full_name : 'Client User';
    const clientEmail = item.client ? item.client.email : 'N/A';
    const initials = clientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';
    const statusCfg = getStatusConfig(item.status);
    const StatusIcon = statusCfg.icon;

    const dateObj = item.start_time_utc ? new Date(item.start_time_utc) : null;
    const formattedDate = dateObj 
      ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      : 'Date Pending';
    const formattedTime = dateObj
      ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
      : 'Time Pending';

    return (
      <View style={styles.card}>
        {/* Top Header with Client Profile & Status Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.clientProfileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{clientName}</Text>
              <View style={styles.clientEmailRow}>
                <Mail size={12} color={colors.textMuted} />
                <Text style={styles.clientEmail}>{clientEmail}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
            <StatusIcon size={12} color={statusCfg.text} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
          </View>
        </View>

        {/* Booked Time Slot Banner */}
        <View style={styles.timeSlotBanner}>
          <View style={styles.timeSlotRow}>
            <Calendar size={15} color={chromatic.indigo.primary} />
            <Text style={styles.timeSlotDate}>{formattedDate}</Text>
          </View>
          <View style={styles.timeSlotRow}>
            <Clock size={14} color={chromatic.indigo.secondary} />
            <Text style={styles.timeSlotHour}>{formattedTime}</Text>
          </View>
        </View>

        {/* Client Note */}
        {item.notes ? (
          <View style={styles.noteContainer}>
            <MessageSquareQuote size={15} color={chromatic.violet.primary} style={styles.noteIcon} />
            <Text style={styles.notesText}>"{item.notes}"</Text>
          </View>
        ) : null}

        {/* Action Controls */}
        <View style={styles.actionRow}>
          {item.status === 'PENDING' && (
            <>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.acceptBtn]} 
                onPress={() => handleUpdateStatus(item.id, 'CONFIRMED')}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={16} color="#FFFFFF" />
                <Text style={styles.acceptBtnText}>Accept Request</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.declineBtn]} 
                onPress={() => handleUpdateStatus(item.id, 'REJECTED')}
                activeOpacity={0.85}
              >
                <XCircle size={16} color={chromatic.rose.primary} />
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'CONFIRMED' && (
            <>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.completeBtn]} 
                onPress={() => handleUpdateStatus(item.id, 'COMPLETED')}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={16} color="#FFFFFF" />
                <Text style={styles.completeBtnText}>Mark Completed</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionBtn, styles.cancelBtn]} 
                onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {(item.status === 'COMPLETED' || item.status === 'CANCELLED' || item.status === 'REJECTED') && (
            <View style={styles.archivedRow}>
              <Text style={styles.archivedText}>Session concluded • Recorded in history</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FC" />
      
      {/* Background Ambient Glows & Grid */}
      <AppBackground variant="violet" style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTag}>
          <LayoutList size={13} color={chromatic.indigo.primary} />
          <Text style={styles.headerTagText}>CONSULTATION HUB</Text>
        </View>

        <Text style={styles.title}>Client Bookings</Text>
        <Text style={styles.subtitle}>Manage schedule requests and confirmed appointments</Text>
      </View>

      {/* Filter Row */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = statusFilter === item.id;
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setStatusFilter(item.id)}
                activeOpacity={0.8}
              >
                <IconComponent 
                  size={13} 
                  color={isActive ? '#FFFFFF' : colors.textMuted} 
                  style={{ marginRight: 5 }} 
                />
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={chromatic.indigo.primary} />
          <Text style={styles.loadingText}>Loading booking requests...</Text>
        </View>
      ) : filteredAppointments.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Inbox size={38} color={chromatic.indigo.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Bookings in this Category</Text>
          <Text style={styles.emptySubtitle}>
            {statusFilter === 'ALL' 
              ? 'You do not have any client requests yet. Make sure your availability slots are published!'
              : `There are currently no bookings with "${statusFilter}" status.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[chromatic.indigo.primary]} 
              tintColor={chromatic.indigo.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 54,
  },
  ambientGlowIndigo: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  ambientGlowViolet: {
    position: 'absolute',
    bottom: 120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(168, 85, 247, 0.10)',
  },
  topHeader: {
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
    marginBottom: 8,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: chromatic.indigo.primary,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterList: {
    paddingHorizontal: 22,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(203, 213, 225, 0.8)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  filterPillActive: {
    backgroundColor: chromatic.indigo.primary,
    borderColor: chromatic.indigo.primary,
    shadowColor: chromatic.indigo.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: chromatic.indigo.primary,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  clientEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  clientEmail: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeSlotBanner: {
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    gap: 6,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSlotDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  timeSlotHour: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: chromatic.violet.bg,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: chromatic.violet.border,
    gap: 8,
  },
  noteIcon: {
    marginTop: 2,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  acceptBtn: {
    flex: 1.4,
    backgroundColor: chromatic.emerald.primary,
    shadowColor: chromatic.emerald.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: chromatic.rose.bg,
    borderColor: chromatic.rose.border,
    borderWidth: 1,
  },
  declineBtnText: {
    color: chromatic.rose.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  completeBtn: {
    flex: 1.4,
    backgroundColor: chromatic.indigo.primary,
    shadowColor: chromatic.indigo.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderColor: 'rgba(203, 213, 225, 0.8)',
    borderWidth: 1,
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  archivedRow: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
  },
  archivedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDim,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },
});

