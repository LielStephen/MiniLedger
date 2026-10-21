import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { GlassCard } from './GlassCard';
import { Pill } from './Pill';
import { colors, radii, typography, spacing } from '../theme';

export interface LoanItem {
  id: string;
  userId: string;
  friendName: string;
  amount: number;
  dueDate: string;
  isRepaid: boolean;
  repaidAt: string | null;
  receiptUrl: string | null;
  isOverdue: boolean;
  daysOverdue: number;
  createdAt: string;
}

interface LoanCardProps {
  loan: LoanItem;
  onRepay: (id: string) => void;
  onViewReceipt?: (url: string) => void;
}

export const LoanCard: React.FC<LoanCardProps> = ({
  loan,
  onRepay,
  onViewReceipt,
}) => {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleRepayPress = () => {
    Alert.alert(
      'Confirm Repayment',
      `Did ${loan.friendName} repay ${formatCurrency(loan.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Repaid',
          style: 'default',
          onPress: () => onRepay(loan.id),
        },
      ]
    );
  };

  // Card background styling based on status
  const cardStyle = [
    styles.card,
    loan.isOverdue && styles.cardOverdue,
    loan.isRepaid && styles.cardRepaid,
  ];

  return (
    <GlassCard style={cardStyle} borderRadius={radii.md}>
      <View style={styles.topRow}>
        <View style={styles.friendInfo}>
          <Text
            style={[
              styles.friendName,
              loan.isRepaid && styles.mutedText,
            ]}
          >
            {loan.friendName}
          </Text>
          <Text style={styles.dueDateText}>
            {loan.isRepaid
              ? `Repaid on ${formatDate(loan.repaidAt || loan.dueDate)}`
              : `Due: ${formatDate(loan.dueDate)}`}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amountText,
              loan.isOverdue && styles.overdueAmount,
              loan.isRepaid && styles.repaidAmount,
            ]}
          >
            {formatCurrency(loan.amount)}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.pillRow}>
          {loan.isRepaid && <Pill label="✓ Repaid" variant="repaid" />}
          {loan.isOverdue && (
            <Pill
              label={`! Overdue (${loan.daysOverdue}d)`}
              variant="overdue"
            />
          )}
          {!loan.isRepaid && !loan.isOverdue && (
            <Pill label="Pending" variant="pending" />
          )}

          {loan.receiptUrl && (
            <TouchableOpacity
              onPress={() => onViewReceipt && onViewReceipt(loan.receiptUrl!)}
              style={styles.receiptButton}
              accessibilityLabel="View receipt"
            >
              <Text style={styles.receiptLabel}>📎 Receipt</Text>
            </TouchableOpacity>
          )}
        </View>

        {!loan.isRepaid && (
          <TouchableOpacity
            onPress={handleRepayPress}
            style={styles.repayButton}
            accessibilityLabel={`Mark loan from ${loan.friendName} as repaid`}
          >
            <Text style={styles.repayButtonText}>Mark Repaid</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Optional receipt thumbnail preview */}
      {loan.receiptUrl && (
        <TouchableOpacity
          onPress={() => onViewReceipt && onViewReceipt(loan.receiptUrl!)}
          activeOpacity={0.8}
          style={styles.thumbnailContainer}
        >
          <Image
            source={{ uri: loan.receiptUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: 6,
  },
  cardOverdue: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 109, 0.4)',
    backgroundColor: 'rgba(255, 240, 243, 0.75)',
  },
  cardRepaid: {
    opacity: 0.75,
    backgroundColor: 'rgba(240, 253, 248, 0.65)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  friendInfo: {
    flex: 1,
    marginRight: 12,
  },
  friendName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    color: colors.textNavy,
    letterSpacing: 0.2,
  },
  dueDateText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSlate,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textNavy,
  },
  overdueAmount: {
    color: colors.accentCoral,
  },
  repaidAmount: {
    color: colors.accentMint,
    textDecorationLine: 'line-through',
  },
  mutedText: {
    color: colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(217, 226, 236, 0.6)',
  },
  receiptLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 11,
    color: colors.textNavy,
  },
  repayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.accentMint,
  },
  repayButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: colors.accentMint,
  },
  thumbnailContainer: {
    marginTop: 10,
    borderRadius: radii.sm,
    overflow: 'hidden',
    height: 90,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});
