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
import { colors, radii } from '../theme/colors';
import { Bell, X, Check, Calendar, Clock, AlertCircle } from './LucideIcons';
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
                  <Bell size={20} color={colors.primary} />
                  <Text style={styles.titleText}>Notifications</Text>
                </View>
                <View style={styles.headerActions}>
                  {notifications.some((n) => !n.is_read) && (
                    <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                      <Text style={styles.markAllBtnText}>Mark all read</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                    <X size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content */}
              {loading ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading updates...</Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Bell size={26} color="#94a3b8" />
                  </View>
                  <Text style={styles.emptyTitle}>No notifications yet</Text>
                  <Text style={styles.emptySubtitle}>
                    When you receive booking requests or schedule updates, they will appear here.
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    marginTop: 8,
  },
  centerContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemCardUnread: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
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
    backgroundColor: colors.primary,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#0f172a',
  },
  itemTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
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
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
});
