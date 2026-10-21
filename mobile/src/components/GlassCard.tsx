import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii, shadows } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 45,
  borderRadius = radii.lg,
}) => {
  return (
    <View style={[styles.shadowContainer, { borderRadius }, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={intensity}
          tint="light"
          style={[styles.blurWrapper, { borderRadius }]}
        >
          <View style={[styles.innerContent, { borderRadius }]}>{children}</View>
        </BlurView>
      ) : (
        <View style={[styles.androidFallback, { borderRadius }]}>
          <View style={[styles.innerContent, { borderRadius }]}>{children}</View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    ...shadows.glass,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  blurWrapper: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassFill,
  },
  androidFallback: {
    backgroundColor: colors.glassFillDense,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  innerContent: {
    padding: 18,
  },
});
