import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { getCreatorAppointments } from '../../services/api';

interface Props {
  currentUser: any;
  onNavigateToSchedule: () => void;
  onNavigateToBookings: () => void;
}

export default function CreatorDashboardScreen({ 
  currentUser, 
  onNavigateToSchedule, 
  onNavigateToBookings 
}: Props) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const appts = await getCreatorAppointments();
      setAppointments(Array.isArray(appts) ? appts : []);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const totalBookings = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;

  const creatorProfile = currentUser?.creator_profile || {};

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{currentUser ? currentUser.full_name : 'Creator User'}</Text>
        </View>
        <View style={styles.creatorBadge}>
          <Text style={styles.creatorBadgeText}>CREATOR</Text>
        </View>
      </View>

      {/* Hero Stats Card (Admin Gradient Aesthetics) */}
      <View style={styles.heroGradientCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconBox}>
            <Text style={styles.heroIconText}>⚡</Text>
          </View>
          <TouchableOpacity style={styles.heroDetailBtn} onPress={onNavigateToBookings}>
            <Text style={styles.heroDetailBtnText}>View Bookings →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroMetrics}>
          <Text style={styles.heroValue}>{totalBookings}</Text>
          <Text style={styles.heroLabel}>Total Client Appointments Booked</Text>
        </View>

        <View style={styles.heroFooter}>
          <View style={styles.subMetric}>
            <Text style={styles.subValue}>{confirmedCount}</Text>
            <Text style={styles.subLabel}>Confirmed / Done</Text>
          </View>
          <View style={styles.subMetricDivider} />
          <View style={styles.subMetric}>
            <Text style={styles.subValue}>{pendingCount}</Text>
            <Text style={styles.subLabel}>Pending Requests</Text>
          </View>
        </View>
      </View>

      {/* Profile Overview Card */}
      <View style={styles.cardPanel}>
        <Text style={styles.panelTitle}>Profile Configuration</Text>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Category:</Text>
          <Text style={styles.profileValue}>{creatorProfile.category || 'General'}</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Title:</Text>
          <Text style={styles.profileValue}>{creatorProfile.title || 'Consultant'}</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Hourly Rate:</Text>
          <Text style={[styles.profileValue, { color: colors.success }]}>${creatorProfile.hourly_rate || 0}/hr</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Slot Duration:</Text>
          <Text style={styles.profileValue}>{creatorProfile.slot_duration_minutes || 30} minutes</Text>
        </View>
      </View>

      {/* Quick Action Shortcuts */}
      <Text style={styles.sectionTitle}>Quick Management Shortcuts</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={onNavigateToSchedule}>
          <View style={[styles.actionIconCircle, { backgroundColor: colors.subtleBg }]}>
            <Text style={styles.actionIcon}>⏰</Text>
          </View>
          <Text style={styles.actionTitle}>Weekly Schedule</Text>
          <Text style={styles.actionSubtitle}>Configure working hours & day rules</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={onNavigateToBookings}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#ecfdf5' }]}>
            <Text style={styles.actionIcon}>📅</Text>
          </View>
          <Text style={styles.actionTitle}>Client Requests</Text>
          <Text style={styles.actionSubtitle}>Approve, complete, or cancel bookings</Text>
        </TouchableOpacity>
      </View>
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
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  creatorBadge: {
    backgroundColor: '#eefcfd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  creatorBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentCyan,
  },
  heroGradientCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconText: {
    fontSize: 18,
  },
  heroDetailBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  heroDetailBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  heroMetrics: {
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  subMetric: {
    flex: 1,
  },
  subValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  subLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  subMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  cardPanel: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderColor,
    gap: 10,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  profileValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 6,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
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
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
