import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { getCreators, getNotifications } from '../../services/api';
import { Star, Bookmark, Clock, ChevronRight, CheckCircle2, Bell } from '../../components/LucideIcons';
import NotificationsModal from '../../components/NotificationsModal';

interface Props {
  onSelectCreator: (creator: any) => void;
  currentUser: any;
  onNavigateToBookings?: () => void;
}

const CATEGORY_ITEMS = [
  { label: 'ALL', key: 'ALL', color: '#4f46e5', bg: '#4f46e5', text: '#ffffff' },
  { label: 'Doctor', key: 'Doctor', color: '#0d9488', bg: '#f0fdfa', text: '#0f766e', border: '#bbf7d0' },
  { label: 'Lawyer', key: 'Lawyer', color: '#059669', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  { label: 'Barber', key: 'Barber', color: '#e11d48', bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  { label: 'Consultant', key: 'Consultant', color: '#d97706', bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  { label: 'Fitness', key: 'Fitness', color: '#0284c7', bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  { label: 'General', key: 'General', color: '#64748b', bg: '#f8fafc', text: '#334155', border: '#e2e8f0' },
];

export default function ClientHomeScreen({ onSelectCreator, currentUser, onNavigateToBookings }: Props) {
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await getNotifications();
      if (res && typeof res.unread_count === 'number') {
        setUnreadNotifCount(res.unread_count);
      }
    } catch {}
  };

  const fetchCreators = async () => {
    try {
      const data = await getCreators(
        selectedCategory === 'ALL' ? undefined : selectedCategory,
        searchQuery ? searchQuery.trim() : undefined
      );
      setCreators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Fetch creators error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCreators();
    fetchUnreadCount();
  }, [selectedCategory]);

  const handleSearchSubmit = () => {
    setLoading(true);
    fetchCreators();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCreators();
    fetchUnreadCount();
  };

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryTheme = (cat?: string) => {
    const found = CATEGORY_ITEMS.find(c => c.key.toLowerCase() === (cat || '').toLowerCase());
    if (found) return found;
    return CATEGORY_ITEMS[6]; // General fallback
  };

  const renderCreatorCard = ({ item }: { item: any }) => {
    const catTheme = getCategoryTheme(item.category);
    const creatorName = item.user?.full_name || item.title || 'Specialist Creator';
    const creatorRole = item.title || item.category || 'Professional Consultant';
    const avatarUrl = item.user?.avatar_url;
    const initials = creatorName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CR';
    const isBookmarked = !!bookmarked[item.id];

    return (
      <TouchableOpacity 
        style={styles.creatorCard} 
        activeOpacity={0.88}
        onPress={() => onSelectCreator(item)}
      >
        <View style={styles.cardHeader}>
          {/* Avatar with real photo or clean monogram + verified badge */}
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarPhoto} />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: catTheme.color }]}>
                <Text style={styles.avatarLetter}>{initials}</Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={13} color="#ffffff" strokeWidth={2.6} />
            </View>
          </View>

          {/* Name, Role & Rating */}
          <View style={styles.headerInfo}>
            <View style={styles.nameBookmarkRow}>
              <Text style={styles.creatorName} numberOfLines={1}>{creatorName}</Text>
              <TouchableOpacity 
                style={styles.bookmarkBtn}
                onPress={() => toggleBookmark(item.id)}
                activeOpacity={0.7}
              >
                <Bookmark 
                  size={18} 
                  color={isBookmarked ? colors.primary : '#94a3b8'} 
                  fill={isBookmarked ? colors.primary : 'none'} 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.creatorTitle} numberOfLines={1}>{creatorRole}</Text>

            <View style={styles.metaRow}>
              <View style={[styles.categoryBadge, { backgroundColor: catTheme.bg, borderColor: catTheme.border || '#cbd5e1' }]}>
                <Text style={[styles.categoryBadgeText, { color: catTheme.text }]}>
                  {item.category || 'General'}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingValue}>4.9</Text>
                <Text style={styles.ratingCount}>(128)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Short Bio */}
        <Text style={styles.creatorBio} numberOfLines={2}>
          {item.bio || 'Available for professional consultation and schedule slot bookings.'}
        </Text>

        <View style={styles.cardDivider} />

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerMeta}>
            <View style={styles.durationRow}>
              <Clock size={13} color="#64748b" />
              <Text style={styles.durationText}>{item.slot_duration_minutes || 30} mins</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.rateText}>
                ₦{Number(item.hourly_rate || 0).toLocaleString()}
              </Text>
              <Text style={styles.rateUnit}>/hr</Text>
            </View>
          </View>

          {/* Book Slot CTA Button */}
          <TouchableOpacity 
            style={styles.bookSlotBtn}
            activeOpacity={0.82}
            onPress={() => onSelectCreator(item)}
          >
            <Text style={styles.bookSlotBtnText}>Book Session</Text>
            <ChevronRight size={15} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Welcome Header Bar (Stitch Screen 3 Alignment) */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{currentUser ? currentUser.full_name : 'Anayolico'}</Text>
            <View style={styles.onlineDot} />
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.bellBtn} 
            onPress={() => setShowNotifModal(true)}
            activeOpacity={0.75}
          >
            <Bell size={21} color="#334155" strokeWidth={2} />
            {unreadNotifCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.clientRoleBadge}>
            <Text style={styles.clientRoleBadgeText}>CLIENT</Text>
          </View>
        </View>
      </View>

      {/* Clean Search Bar (Without left/right icons) */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInputClean}
          placeholder="Search doctor, lawyer, barber..."
          placeholderTextColor={colors.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); fetchCreators(); }}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips (Clean text-only without emojis) */}
      <View style={styles.categorySection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {CATEGORY_ITEMS.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  { backgroundColor: isActive ? colors.primary : cat.bg, borderColor: isActive ? colors.primary : (cat.border || colors.borderColor) }
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={[
                  styles.categoryChipText,
                  { color: isActive ? '#ffffff' : cat.text }
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotifModal}
        onClose={() => {
          setShowNotifModal(false);
          fetchUnreadCount();
        }}
        onNotificationsUpdated={fetchUnreadCount}
        onSelectAppointment={() => {
          setShowNotifModal(false);
          if (onNavigateToBookings) onNavigateToBookings();
        }}
      />

      {/* Specialist Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching available specialists...</Text>
        </View>
      ) : creators.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🩺</Text>
          <Text style={styles.emptyTitle}>No specialists found</Text>
          <Text style={styles.emptySubtitle}>Try selecting another category or clear your search query.</Text>
        </View>
      ) : (
        <FlatList
          data={creators}
          keyExtractor={(item) => item.id}
          renderItem={renderCreatorCard}
          contentContainerStyle={styles.creatorsList}
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
    paddingTop: 48,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -0.4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  bellBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
  },
  clientRoleBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  clientRoleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInputClean: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMain,
  },
  clearSearch: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '700',
    padding: 4,
  },
  filterBtn: {
    padding: 4,
  },
  filterIcon: {
    fontSize: 15,
  },
  categorySection: {
    marginBottom: 14,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipIcon: {
    fontSize: 13,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  creatorsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 14,
  },
  creatorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarPhoto: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  nameBookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creatorName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  creatorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    color: '#f59e0b',
    fontSize: 12,
  },
  ratingValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textMain,
  },
  ratingCount: {
    fontSize: 10.5,
    color: colors.textDim,
  },
  bookmarkBtn: {
    padding: 6,
  },
  bookmarkIcon: {
    fontSize: 16,
    opacity: 0.4,
  },
  bookmarkIconActive: {
    opacity: 1,
  },
  creatorBio: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clockIcon: {
    fontSize: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  rateText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.success,
  },
  rateUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  bookSlotBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bookSlotBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  bookSlotBtnArrow: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});

