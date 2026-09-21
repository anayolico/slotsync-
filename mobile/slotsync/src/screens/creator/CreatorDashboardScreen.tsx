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
import { getCreatorAppointments, getCreatorAvailabilityRules } from '../../services/api';

interface Props {
  currentUser: any;
  onNavigateToSchedule: () => void;
  onNavigateToBookings: () => void;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CreatorDashboardScreen({ 
  currentUser, 
  onNavigateToSchedule, 
  onNavigateToBookings 
}: Props) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const creatorProfile = currentUser?.creator_profile || {};

  const fetchDashboardData = async () => {
    try {
      const appts = await getCreatorAppointments();
      setAppointments(Array.isArray(appts) ? appts : []);

      if (creatorProfile?.id) {
        const r = await getCreatorAvailabilityRules(creatorProfile.id);
        setRules(Array.isArray(r) ? r : []);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [creatorProfile?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const totalBookings = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Row: Welcome & Creator Badge (Stitch Screen 4 Alignment) */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>WELCOME BACK,</Text>
          <Text style={styles.userName}>{currentUser ? currentUser.full_name : 'Dr. Sarah Jenkins'}</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.creatorBadge}>
            <Text style={styles.creatorBadgeText}>CREATOR</Text>
          </View>
          <TouchableOpacity style={styles.settingsQuickBtn} activeOpacity={0.8}>
            <Text style={styles.settingsQuickIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Analytics Card (Luminous Indigo Gradient - Stitch Spec) */}
      <View style={styles.heroGradientCard}>
        <View style={styles.heroGlowOverlay} />

        <View style={styles.heroHeader}>
          <View style={styles.heroIconBox}>
            <Text style={styles.heroIconText}>⚡</Text>
          </View>
          <TouchableOpacity style={styles.heroDetailBtn} onPress={onNavigateToBookings} activeOpacity={0.8}>
            <Text style={styles.heroDetailBtnText}>View Bookings →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroMetrics}>
          <Text style={styles.heroValue}>{totalBookings}</Text>
          <Text style={styles.heroLabel}>Total Client Appointments Booked</Text>
        </View>

        <View style={styles.heroDivider} />

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

      {/* Weekly Schedule Rules Header Row */}
      <View style={styles.rulesHeaderRow}>
        <View>
          <Text style={styles.rulesTitle}>Weekly Schedule Rules</Text>
          <Text style={styles.rulesSubtitle}>Automated slot generation</Text>
        </View>
        <TouchableOpacity style={styles.addRuleBtn} onPress={onNavigateToSchedule} activeOpacity={0.8}>
          <Text style={styles.addRuleBtnText}>+ Add Rule</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule Rules Card List */}
      {rules.length > 0 ? (
        rules.slice(0, 3).map((rule, idx) => {
          const dayName = WEEKDAY_NAMES[rule.day_of_week] || `Day ${rule.day_of_week}`;
          return (
            <View key={rule.id || idx} style={styles.scheduleRuleCard}>
              <View style={styles.ruleCardLeft}>
                <View style={styles.ruleDayCircle}>
                  <Text style={styles.ruleDayText}>{dayName}</Text>
                </View>
                <View>
                  <Text style={styles.ruleNameText}>{dayName} Working Hours</Text>
                  <Text style={styles.ruleTimeText}>{rule.start_time} - {rule.end_time} ({creatorProfile.slot_duration_minutes || 30} min)</Text>
                </View>
              </View>
              <View style={styles.activeGreenDot} />
            </View>
          );
        })
      ) : (
        <View style={styles.scheduleRuleCard}>
          <View style={styles.ruleCardLeft}>
            <View style={styles.ruleDayCircle}>
              <Text style={styles.ruleDayText}>M-F</Text>
            </View>
            <View>
              <Text style={styles.ruleNameText}>Weekday Standard</Text>
              <Text style={styles.ruleTimeText}>09:00 - 17:00 (30 min slots)</Text>
            </View>
          </View>
          <View style={styles.activeGreenDot} />
        </View>
      )}

      {/* Profile Configuration Card Panel */}
      <View style={styles.cardPanel}>
        <Text style={styles.panelTitle}>Profile Configuration</Text>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Category:</Text>
          <Text style={styles.profileValue}>{creatorProfile.category || 'Doctor'}</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Professional Title:</Text>
          <Text style={styles.profileValue}>{creatorProfile.title || 'Specialist'}</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Hourly Rate:</Text>
          <Text style={[styles.profileValue, { color: colors.success }]}>${creatorProfile.hourly_rate || 150}/hr</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Slot Duration:</Text>
          <Text style={styles.profileValue}>{creatorProfile.slot_duration_minutes || 30} minutes</Text>
        </View>
      </View>

      {/* Quick Action Management Shortcuts */}
      <Text style={styles.sectionTitle}>Quick Management Shortcuts</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={onNavigateToSchedule} activeOpacity={0.88}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#eef2ff' }]}>
            <Text style={styles.actionIcon}>⏰</Text>
          </View>
          <Text style={styles.actionTitle}>Weekly Schedule</Text>
          <Text style={styles.actionSubtitle}>Configure working hours & day rules</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={onNavigateToBookings} activeOpacity={0.88}>
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
    paddingTop: 48,
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
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  creatorBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.6,
  },
  settingsQuickBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsQuickIcon: {
    fontSize: 16,
  },
  heroGradientCard: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 22,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  heroGlowOverlay: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconText: {
    fontSize: 20,
  },
  heroDetailBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },
  heroDetailBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  heroMetrics: {
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 14,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subMetric: {
    flex: 1,
  },
  subValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  subLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
  },
  subMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  rulesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  rulesSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  addRuleBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addRuleBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  scheduleRuleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  ruleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleDayCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleDayText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  ruleNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textMain,
  },
  ruleTimeText: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  activeGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  cardPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderColor,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
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
    marginTop: 4,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
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
    width: 44,
    height: 44,
    borderRadius: 14,
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

