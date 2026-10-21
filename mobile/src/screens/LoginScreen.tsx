import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { GlossyButton } from '../components/GlossyButton';
import { OtpInput } from '../components/OtpInput';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api/client';
import { colors, radii, typography, spacing, shadows } from '../theme';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleRequestOtp = async () => {
    setErrorMessage('');
    setInfoMessage('');
    if (!phone.trim()) {
      setErrorMessage('Please enter your 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await apiService.requestOtp(phone);
      setStep('otp');
      setInfoMessage('OTP generated! Check your backend terminal console for [MOCK OTP].');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to request OTP. Please check the number.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMessage('');
    if (otp.length < 6) {
      setErrorMessage('Please enter the full 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.verifyOtp(phone, otp);
      await login(data.token, data.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid OTP code. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>💎</Text>
            </View>
            <Text style={styles.appTitle}>MiniLedger</Text>
            <Text style={styles.appSubtitle}>
              Clean, effortless tracking for money lent to friends
            </Text>
          </View>

          {/* Form Card */}
          <GlassCard style={styles.formCard}>
            {step === 'phone' ? (
              <>
                <Text style={styles.cardHeader}>Sign In</Text>
                <Text style={styles.cardSubtext}>
                  Enter your mobile number to receive a one-time verification code
                </Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputPrefix}>+91</Text>
                  <TextInput
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="9876543210"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={14}
                    style={styles.phoneInput}
                    accessibilityLabel="Mobile phone number input"
                  />
                </View>

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠ {errorMessage}</Text>
                  </View>
                ) : null}

                <GlossyButton
                  title="Send OTP"
                  onPress={handleRequestOtp}
                  loading={loading}
                  style={styles.actionButton}
                />
              </>
            ) : (
              <>
                <Text style={styles.cardHeader}>Verify Code</Text>
                <Text style={styles.cardSubtext}>
                  We sent a 6-digit code to{' '}
                  <Text style={styles.boldPhone}>
                    {phone.startsWith('+') ? phone : `+91 ${phone}`}
                  </Text>
                </Text>

                {infoMessage ? (
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoText}>💡 {infoMessage}</Text>
                  </View>
                ) : null}

                <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠ {errorMessage}</Text>
                  </View>
                ) : null}

                <GlossyButton
                  title="Verify & Enter"
                  onPress={handleVerifyOtp}
                  loading={loading}
                  style={styles.actionButton}
                />

                <TouchableOpacity
                  onPress={() => {
                    setStep('phone');
                    setOtp('');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  style={styles.changePhoneButton}
                >
                  <Text style={styles.changePhoneText}>← Edit phone number</Text>
                </TouchableOpacity>
              </>
            )}
          </GlassCard>

          {/* Footer note */}
          <Text style={styles.footerNote}>
            Y2K Clean Design • Frutiger Aero Glass Edition
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  logoIcon: {
    fontSize: 32,
  },
  appTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    color: colors.textNavy,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textSlate,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    color: colors.textNavy,
  },
  cardSubtext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSlate,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  boldPhone: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textNavy,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    height: 52,
    marginVertical: 8,
  },
  inputPrefix: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: colors.textSlate,
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 16,
    color: colors.textNavy,
  },
  actionButton: {
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: colors.coralBg,
    borderRadius: radii.sm,
    padding: 10,
    marginTop: 8,
  },
  errorText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.accentCoral,
  },
  infoBadge: {
    backgroundColor: 'rgba(58, 167, 255, 0.12)',
    borderRadius: radii.sm,
    padding: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(58, 167, 255, 0.25)',
  },
  infoText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.primaryAquaDark,
  },
  changePhoneButton: {
    alignSelf: 'center',
    marginTop: 18,
    padding: 8,
  },
  changePhoneText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSlate,
  },
  footerNote: {
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
