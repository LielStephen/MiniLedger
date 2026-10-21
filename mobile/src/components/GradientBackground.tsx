import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

export const GradientBackground: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Sky-to-Lavender smooth gradient background */}
      <LinearGradient
        colors={[colors.gradientBg[0], colors.gradientBg[1]]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Glossy blurred orb 1: Top-Right Aqua */}
      <View style={[styles.orb, styles.orbTopRight]} />

      {/* Glossy blurred orb 2: Bottom-Left Periwinkle */}
      <View style={[styles.orb, styles.orbBottomLeft]} />

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  content: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orbTopRight: {
    width: width * 0.75,
    height: width * 0.75,
    top: -width * 0.2,
    right: -width * 0.2,
    backgroundColor: colors.orbBlue,
  },
  orbBottomLeft: {
    width: width * 0.85,
    height: width * 0.85,
    bottom: -width * 0.3,
    left: -width * 0.3,
    backgroundColor: colors.orbPurple,
  },
});
