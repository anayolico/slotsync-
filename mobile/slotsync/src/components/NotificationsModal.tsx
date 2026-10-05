import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, radii, chromatic, glass, shadows } from '../theme/colors';
import { Bell, X, Check, Calendar, Clock, AlertCircle, Sparkles, CheckCircle2, Inbox } from './LucideIcons';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAppointment?: (appointmentId?: string) => void;
  onNotificationsUpdated?: () => void;
}

export default function NotificationsModal({
  visible,
  onClose,
  onSelectAppointment,
  onNotificationsUpdated,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await getNotifications();
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchNotifs();
    }
  }, [visible]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      if (onNotificationsUpdated) onNotificationsUpdated();
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err);
    }
  };

  const handlePressItem = async (item: any) => {
    try {
      if (!item.is_read) {
        await markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        if (onNotificationsUpdated) onNotificationsUpdated();
      }
    } catch (err) {
      console.warn('Error marking notification read:', err);
    }

    onClose();
    if (onSelectAppointment) {
      onSelectAppointment(item.appointment_id);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag bar */}
              <View style={styles.dragBar} />

              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.titleWrap}>
                  <View style={styles.bellIconCircle}>
                    <Bell size={18} color={chromatic.indigo.primary} />
                  </View>
                  <View>
                    <Text style={styles.titleText}>Notifications</Text>
                    <Text style={styles.subtitleText}>Real-time booking and appointment alerts</Text>
                  </View>
                </View>
                <View style={styles.headerActions}>
                  {notifications.some((n) => !n.is_read) && (
                    <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn} activeOpacity={0.75}>
                      <CheckCircle2 size={13} color={chromatic.indigo.primary} />
                      <Text style={styles.markAllBtnText}>Mark all</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                    <X size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content */}
              {loading ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="small" color={chromatic.indigo.primary} />
                  <Text style={styles.loadingText}>Syncing updates...</Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>All Caught Up!</Text>
                  <Text style={styles.emptySubtitle}>
                    When you receive booking requests or schedule updates, they will appear here in real-time.
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                  {notifications.map((n) => {
                    const isUnread = !n.is_read;
                    const dateFormatted = n.created_at
                      ? new Date(n.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';

                    return (
                      <TouchableOpacity
                        key={n.id}
                        style={[styles.itemCard, isUnread && styles.itemCardUnread]}
                        onPress={() => handlePressItem(n)}
                        activeOpacity={0.75}
                      >
                        <View style={styles.itemHeader}>
                          <View style={styles.itemHeaderLeft}>
                            {isUnread && <View style={styles.unreadDot} />}
                            <Text style={[styles.itemTitle, isUnread && styles.itemTitleUnread]}>
                              {n.title}
                            </Text>
                          </View>
                          <Text style={styles.itemTime}>{dateFormatted}</Text>
                        </View>
                        <Text style={styles.itemMessage}>{n.message}</Text>
                        {n.appointment_id && (
                          <View style={styles.tapToViewWrap}>
                            <Text style={styles.tapToViewText}>Tap to view session details ›</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  dragBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(203, 213, 225, 0.9)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(241, 245, 249, 0.9)',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bellIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    gap: 4,
  },
  markAllBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: chromatic.indigo.primary,
  },
  closeBtn: {
    padding: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  scrollView: {
    marginTop: 10,
  },
  centerContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 44,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: chromatic.indigo.bg,
    borderColor: chromatic.indigo.border,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  itemCard: {
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderRadius: 18,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  itemCardUnread: {
    backgroundColor: 'rgba(238, 242, 255, 0.85)',
    borderColor: 'rgba(199, 210, 254, 0.9)',
    shadowColor: chromatic.indigo.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: chromatic.indigo.primary,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  itemTitleUnread: {
    fontWeight: '900',
    color: '#0F172A',
  },
  itemTime: {
    fontSize: 11,
    color: colors.textDim,
    fontWeight: '600',
  },
  itemMessage: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 2,
  },
  tapToViewWrap: {
    marginTop: 6,
  },
  tapToViewText: {
    fontSize: 12,
    fontWeight: '800',
    color: chromatic.indigo.primary,
  },
});

