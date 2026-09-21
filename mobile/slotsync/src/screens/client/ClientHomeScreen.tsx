import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { colors, radii } from '../../theme/colors';
import { getCreators } from '../../services/api';

interface Props {
  onSelectCreator: (creator: any) => void;
  currentUser: any;
}

const CATEGORIES = ['ALL', 'Doctor', 'Lawyer', 'Barber', 'Consultant', 'Fitness', 'Beauty', 'General'];

export default function ClientHomeScreen({ onSelectCreator, currentUser }: Props) {
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
  }, [selectedCategory]);

  const handleSearchSubmit = () => {
    setLoading(true);
    fetchCreators();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCreators();
  };

  const renderCreatorCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.creatorCard} 
      activeOpacity={0.8}
      onPress={() => onSelectCreator(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {item.title ? item.title.charAt(0).toUpperCase() : 'C'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.creatorTitle}>{item.title || 'Creator Profile'}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category || 'General'}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.creatorBio} numberOfLines={2}>
        {item.bio || 'No bio provided for this creator profile.'}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.metaPill}>
          <Text style={styles.metaIcon}>⏱️</Text>
          <Text style={styles.metaText}>{item.slot_duration_minutes || 30} mins</Text>
        </View>
        <Text style={styles.rateText}>
          ${item.hourly_rate || 0}/hr
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Welcome Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{currentUser ? currentUser.full_name : 'Client User'}</Text>
        </View>
        <View style={styles.clientRoleBadge}>
          <Text style={styles.clientRoleBadgeText}>CLIENT</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
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

      {/* Category Pills */}
      <View style={styles.categorySection}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Creators Grid/List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching available creators...</Text>
        </View>
      ) : creators.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No creators found</Text>
          <Text style={styles.emptySubtitle}>Try selecting another category or clear your search term.</Text>
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
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
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
  clientRoleBadge: {
    backgroundColor: colors.bgSubtle,
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
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radii.pill,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderColor,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textMain,
  },
  clearSearch: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '700',
    padding: 4,
  },
  categorySection: {
    marginBottom: 14,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderColor,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  creatorsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 14,
  },
  creatorCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  creatorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  creatorBio: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  rateText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.success,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
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
