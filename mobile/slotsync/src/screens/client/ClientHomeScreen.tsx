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
  Image,
  Platform
} from 'react-native';
import { colors, radii, shadows } from '../../theme/colors';
import { getCreators, getNotifications } from '../../services/api';
import { Star, Bookmark, Clock, ChevronRight, CheckCircle2, Bell, Search, Sparkles } from '../../components/LucideIcons';
import NotificationsModal from '../../components/NotificationsModal';
import AppBackground from '../../components/AppBackground';

interface Props {
  onSelectCreator: (creator: any) => void;
  currentUser: any;
  onNavigateToBookings?: () => void;
}

const CATEGORY_ITEMS = [
  { label: 'ALL', key: 'ALL', color: '#4F46E5', bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
  { label: 'Doctor', key: 'Doctor', color: '#0D9488', bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  { label: 'Lawyer', key: 'Lawyer', color: '#059669', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  { label: 'Barber', key: 'Barber', color: '#E11D48', bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  { label: 'Consultant', key: 'Consultant', color: '#D97706', bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  { label: 'Fitness', key: 'Fitness', color: '#0284C7', bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  { label: 'Beauty', key: 'Beauty', color: '#EC4899', bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' },
  { label: 'General', key: 'General', color: '#6366F1', bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
];

export default function ClientHomeScreen({ onSelectCreator, currentUser, onNavigateToBookings }: Props) {
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
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
    return CATEGORY_ITEMS[7]; // General fallback
  };

  const renderCreatorCard = ({ item }: { item: any }) => {
    const catTheme = getCategoryTheme(item.category);
    const creatorName = item.user?.full_name || item.title || 'Specialist Creator';
    const creatorRole = item.title || item.category || 'Professional Specialist';
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
          {/* Avatar with photo or vibrant monogram + verified check */}
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarPhoto} />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: catTheme.color }]}>
                <Text style={styles.avatarLetter}>{initials}</Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={13} color="#ffffff" strokeWidth={2.8} />
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bookmark 
                  size={18} 
                  color={isBookmarked ? colors.primary : colors.textDim} 
                  fill={isBookmarked ? colors.primary : 'none'} 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.creatorTitle} numberOfLines={1}>{creatorRole}</Text>

            <View style={styles.metaRow}>
              <View style={[styles.categoryBadge, { backgroundColor: catTheme.bg, borderColor: catTheme.border }]}>
                <Text style={[styles.categoryBadgeText, { color: catTheme.text }]}>
                  {item.category || 'General'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Short Bio */}
        <Text style={styles.creatorBio} numberOfLines={2}>
          {item.bio || 'Available for professional consultation and verified schedule slot bookings.'}
        </Text>

        <View style={styles.cardDivider} />

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerMeta}>
            <View style={styles.durationRow}>
              <Clock size={13} color={colors.textDim} strokeWidth={2} />
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
            activeOpacity={0.85}
            onPress={() => onSelectCreator(item)}
          >
            <Text style={styles.bookSlotBtnText}>Book Session</Text>
            <ChevronRight size={15} color="#ffffff" strokeWidth={2.6} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AppBackground variant="default" style={styles.container}>
      {/* Top Welcome Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>WELCOME BACK,</Text>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{currentUser ? currentUser.full_name : 'Specialist Client'}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.bellBtn} 
            onPress={() => setShowNotifModal(true)}
            activeOpacity={0.75}
          >
            <Bell size={20} color={colors.textMain} strokeWidth={2.2} />
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

      {/* Glass Search Bar */}
      <View style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}>
        <Search size={18} color={searchFocused ? colors.primary : colors.textDim} strokeWidth={2.2} />
        <TextInput
          style={styles.searchInputClean}
          placeholder="Search doctor, lawyer, barber, coach..."
          placeholderTextColor={colors.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); fetchCreators(); }} style={styles.clearSearchTouch}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips Scroll */}
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
                  { 
                    backgroundColor: isActive ? cat.color : cat.bg, 
                    borderColor: isActive ? cat.color : cat.border 
                  },
                  isActive && shadows.primaryGlow
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
          <Text style={styles.emptyTitle}>No specialists found</Text>
          <Text style={styles.emptySubtitle}>Try selecting another category or clear your search query.</Text>
        </View>
      ) : (
        <FlatList
          data={creators}
          keyExtractor={(item) => item.id}
          renderItem={renderCreatorCard}
          contentContainerStyle={styles.creatorsList}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1.2,
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
    color: '#3730A3',
    letterSpacing: -0.4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...shadows.subtle,
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
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
    fontWeight: '900',
  },
  clientRoleBadge: {
    backgroundColor: colors.primaryWash,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.lg,
    marginHorizontal: 22,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    marginBottom: 14,
    gap: 10,
    ...shadows.subtle,
  },
  searchBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    ...shadows.card,
  },
  searchInputClean: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMain,
  },
  clearSearchTouch: {
    padding: 4,
  },
  clearSearch: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '700',
  },
  categorySection: {
    marginBottom: 14,
  },
  categoriesList: {
    paddingHorizontal: 22,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 7.5,
    borderRadius: radii.pill,
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  creatorsList: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 16,
  },
  creatorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: radii.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.95)',
    ...shadows.card,
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
    borderRadius: radii.md,
    backgroundColor: colors.bgSubtle,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
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
    backgroundColor: colors.success,
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
    color: colors.textMain,
    letterSpacing: -0.2,
  },
  creatorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDim,
    marginTop: 1,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radii.xs,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.textMain,
  },
  ratingCount: {
    fontSize: 11,
    color: colors.textDim,
  },
  bookmarkBtn: {
    padding: 4,
  },
  creatorBio: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18.5,
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
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
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDim,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rateText: {
    fontSize: 15.5,
    fontWeight: '900',
    color: colors.successDark,
  },
  rateUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  bookSlotBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...shadows.primaryGlow,
  },
  bookSlotBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 13.5,
    color: colors.textMuted,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyContainer: {
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
  emptyTitle: {
    fontSize: 18,
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
