import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from './GlassCard';
import { colors, radii, typography, spacing } from '../theme';

export interface LoanSummary {
  totalLent: number;
  totalRepaid: number;
  totalPending: number;
  overdueAmount: number;
  overdueCount: number;
}

interface SummaryCardProps {
  summary: LoanSummary;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate repaid percentage for chrome progress bar
  const percentageRepaid =
    summary.totalLent > 0
      ? Math.min(100, Math.round((summary.totalRepaid / summary.totalLent) * 100))
      : 0;

  return (
    <GlassCard style={styles.card}>
      {/* Sparkle decorative accents */}
      <View style={styles.headerRow}>
        <Text style={styles.label}>TOTAL LENT</Text>
        <Text style={styles.sparkle}>✦ ✧</Text>
      </View>

      {/* Big Friendly Primary Number */}
      <Text style={styles.heroAmount}>{formatCurrency(summary.totalLent)}</Text>

      {/* Chrome Gradient Progress Bar (Repaid vs Lent) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.accentMint, '#3AA7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${percentageRepaid}%` }]}
          />
        </View>
        <Text style={styles.progressLabel}>{percentageRepaid}% recovered</Text>
      </View>

      {/* 3 Metric Columns: Repaid, Pending, Overdue */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>REPAID</Text>
          <Text style={[styles.metricValue, { color: colors.accentMint }]}>
            {formatCurrency(summary.totalRepaid)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>PENDING</Text>
          <Text style={[styles.metricValue, { color: colors.primaryAquaDark }]}>
            {formatCurrency(summary.totalPending)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.accentCoral }]}>
            OVERDUE {summary.overdueCount > 0 ? `(${summary.overdueCount})` : ''}
          </Text>
          <Text style={[styles.metricValue, { color: colors.accentCoral }]}>
            {formatCurrency(summary.overdueAmount)}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.textSlate,
    textTransform: 'uppercase',
  },
  sparkle: {
    fontSize: 14,
    color: colors.primaryAqua,
    letterSpacing: 2,
  },
  heroAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    color: colors.textNavy,
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  progressContainer: {
    marginVertical: spacing.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(217, 226, 236, 0.75)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  progressLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSlate,
    marginTop: 4,
    textAlign: 'right',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 226, 236, 0.6)',
    marginTop: 4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textSlate,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(217, 226, 236, 0.7)',
  },
});
