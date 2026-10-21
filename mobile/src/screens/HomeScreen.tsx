import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { SummaryCard, LoanSummary } from '../components/SummaryCard';
import { LoanCard, LoanItem } from '../components/LoanCard';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api/client';
import { colors, radii, typography, spacing, shadows } from '../theme';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, user } = useAuth();

  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [summary, setSummary] = useState<LoanSummary>({
    totalLent: 0,
    totalRepaid: 0,
    totalPending: 0,
    overdueAmount: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [loansData, summaryData] = await Promise.all([
        apiService.getLoans(),
        apiService.getSummary(),
      ]);
      setLoans(loansData);
      setSummary(summaryData);
    } catch (err) {
      console.error('[HomeScreen] Error fetching ledger data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch when screen mounts or comes into focus after adding an entry
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRepay = async (loanId: string) => {
    try {
      await apiService.repayLoan(loanId);
      // Refresh list and summary math
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to mark loan as repaid';
      Alert.alert('Error', msg);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <GradientBackground>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userPhoneText}>{user?.phone || 'Ledger'}</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          accessibilityLabel="Log out"
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryAqua} />
          <Text style={styles.loadingText}>Loading your ledger...</Text>
        </View>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<SummaryCard summary={summary} />}
          renderItem={({ item }) => (
            <LoanCard
              loan={item}
              onRepay={handleRepay}
              onViewReceipt={(url) => setActiveReceiptUrl(url)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primaryAqua}
              colors={[colors.primaryAqua]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>✨</Text>
                <Text style={styles.emptyTitle}>All Clear!</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't tracked any loans yet. Tap the '+' button below to record money lent to a friend.
                </Text>
              </GlassCard>
            </View>
          }
        />
      )}

      {/* Floating Action Button '+' */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddEntry')}
        style={styles.fab}
        activeOpacity={0.85}
        accessibilityLabel="Add new loan entry"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Receipt Full-Screen Modal */}
      <Modal
        visible={Boolean(activeReceiptUrl)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveReceiptUrl(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setActiveReceiptUrl(null)}
          >
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          {activeReceiptUrl && (
            <Image
              source={{ uri: activeReceiptUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.sm,
  },
  welcomeText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSlate,
  },
  userPhoneText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textNavy,
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  logoutText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.textSlate,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textSlate,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 38,
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textNavy,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSlate,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryAqua,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.glossyButton,
  },
  fabIcon: {
    fontSize: 34,
    color: colors.textWhite,
    lineHeight: 38,
    fontWeight: '300',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 32, 58, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
  modalCloseText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textWhite,
  },
  fullImage: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: radii.md,
  },
});
