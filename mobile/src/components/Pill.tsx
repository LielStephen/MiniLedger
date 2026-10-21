import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radii, typography } from '../theme';

export type PillVariant = 'overdue' | 'repaid' | 'pending';

interface PillProps {
  label: string;
  variant: PillVariant;
  style?: StyleProp<ViewStyle>;
}

export const Pill: React.FC<PillProps> = ({ label, variant, style }) => {
  const getColors = () => {
    switch (variant) {
      case 'overdue':
        return {
          bg: colors.coralBg,
          text: colors.accentCoral,
          border: 'rgba(255, 77, 109, 0.35)',
        };
      case 'repaid':
        return {
          bg: colors.mintBg,
          text: colors.accentMint,
          border: 'rgba(16, 185, 129, 0.35)',
        };
      case 'pending':
      default:
        return {
          bg: 'rgba(58, 167, 255, 0.12)',
          text: colors.primaryAquaDark,
          border: 'rgba(58, 167, 255, 0.35)',
        };
    }
  };

  const scheme = getColors();

  return (
    <View
      style={[
        styles.pillContainer,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
        },
        style,
      ]}
    >
      <Text style={[styles.pillText, { color: scheme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
