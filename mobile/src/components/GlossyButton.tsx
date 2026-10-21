import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, shadows, typography } from '../theme';

interface GlossyButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'mint' | 'coral';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const GlossyButton: React.FC<GlossyButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  // Determine base gradient colors based on variant
  const getGradientColors = (): readonly [string, string] => {
    if (disabled) return ['#CBD5E1', '#94A3B8'] as const;
    switch (variant) {
      case 'secondary':
        return [colors.secondaryPeriwinkle, '#7083FF'] as const;
      case 'mint':
        return [colors.accentMint, '#059669'] as const;
      case 'coral':
        return [colors.accentCoral, '#E11D48'] as const;
      case 'primary':
      default:
        return [colors.primaryAqua, colors.primaryAquaDark] as const;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[styles.pressableWrapper, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientContainer}
        >
          {/* Top gloss curve highlight for Frutiger Aero jelly glass effect */}
          <LinearGradient
            colors={[colors.buttonGlossTop, colors.buttonGlossBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.topGloss}
          />

          <View style={styles.contentRow}>
            {loading ? (
              <ActivityIndicator color={colors.textWhite} size="small" />
            ) : (
              <>
                {icon && <View style={styles.iconWrapper}>{icon}</View>}
                <Text style={[styles.buttonText, textStyle]}>{title}</Text>
              </>
            )}
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressableWrapper: {
    borderRadius: radii.pill,
    ...shadows.glossyButton,
    minHeight: 50,
  },
  gradientContainer: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minHeight: 50,
  },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrapper: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 16,
    color: colors.textWhite,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.65,
    shadowOpacity: 0,
  },
});
