import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { GlossyButton } from '../components/GlossyButton';
import { apiService } from '../api/client';
import { colors, radii, typography, spacing, shadows } from '../theme';

export const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation();

  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 7 days in future
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    friendName?: string;
    amount?: string;
    general?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!friendName.trim()) {
      newErrors.friendName = 'Friend name is required';
    }
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than ₹0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Camera roll permission is required to attach receipt images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const formattedDate = dueDate.toISOString().split('T')[0];
      await apiService.createLoan({
        friendName: friendName.trim(),
        amount: parseFloat(amount),
        dueDate: formattedDate,
        receiptUri: receiptUri || undefined,
      });

      // Navigate back to Home screen (HomeScreen will automatically refresh via useFocusEffect)
      navigation.goBack();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create loan entry';
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setLoading(false);
    }
  };

  // Quick preset helper
  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDueDate(d);
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Header bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Loan Entry</Text>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <GlassCard style={styles.formCard}>
            {/* Friend Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>FRIEND'S NAME</Text>
              <View style={[styles.inputBox, errors.friendName && styles.inputError]}>
                <TextInput
                  value={friendName}
                  onChangeText={(text) => {
                    setFriendName(text);
                    if (errors.friendName) setErrors((prev) => ({ ...prev, friendName: undefined }));
                  }}
                  placeholder="e.g. Alex Chen"
                  placeholderTextColor={colors.textMuted}
                  style={styles.textInput}
                  accessibilityLabel="Friend's name input"
                />
              </View>
              {errors.friendName ? (
                <Text style={styles.errorText}>⚠ {errors.friendName}</Text>
              ) : null}
            </View>

            {/* Amount */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>AMOUNT (₹)</Text>
              <View style={[styles.inputBox, errors.amount && styles.inputError]}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  placeholder="1500.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={styles.textInput}
                  accessibilityLabel="Loan amount input"
                />
              </View>
              {errors.amount ? (
                <Text style={styles.errorText}>⚠ {errors.amount}</Text>
              ) : null}
            </View>

            {/* Due Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>DUE DATE</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateSelector}
                accessibilityLabel="Select due date"
              >
                <Text style={styles.dateText}>
                  📅 {dueDate.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.dateChangeLabel}>Change</Text>
              </TouchableOpacity>

              {/* Quick Preset Buttons */}
              <View style={styles.presetRow}>
                <TouchableOpacity
                  onPress={() => setQuickDate(7)}
                  style={styles.presetPill}
                >
                  <Text style={styles.presetText}>+1 Week</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setQuickDate(14)}
                  style={styles.presetPill}
                >
                  <Text style={styles.presetText}>+2 Weeks</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setQuickDate(30)}
                  style={styles.presetPill}
                >
                  <Text style={styles.presetText}>+1 Month</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) setDueDate(selectedDate);
                  }}
                />
              )}
            </View>

            {/* Optional Receipt Attachment */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>RECEIPT / PHOTO (OPTIONAL)</Text>

              {receiptUri ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: receiptUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    onPress={() => setReceiptUri(null)}
                    style={styles.removeReceiptButton}
                  >
                    <Text style={styles.removeReceiptText}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.uploadBox}
                  accessibilityLabel="Attach receipt image"
                >
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Attach Receipt or Bill (max 5MB)</Text>
                  <Text style={styles.uploadSubtext}>Supports JPG and PNG</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* General Submission Error */}
            {errors.general ? (
              <View style={styles.generalErrorBox}>
                <Text style={styles.errorText}>⚠ {errors.general}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <GlossyButton
              title="Save Loan Entry"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.sm,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 14,
    color: colors.textSlate,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textNavy,
  },
  backPlaceholder: {
    width: 60,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  formCard: {
    marginTop: spacing.sm,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: colors.textSlate,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: colors.accentCoral,
  },
  currencyPrefix: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textNavy,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 16,
    color: colors.textNavy,
  },
  errorText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.accentCoral,
    marginTop: 6,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    height: 52,
  },
  dateText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 15,
    color: colors.textNavy,
  },
  dateChangeLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: colors.primaryAquaDark,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(58, 167, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(58, 167, 255, 0.3)',
  },
  presetText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 12,
    color: colors.primaryAquaDark,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.glassBorderSubtle,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  uploadText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 13,
    color: colors.textNavy,
  },
  uploadSubtext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: colors.textSlate,
    marginTop: 2,
  },
  previewContainer: {
    position: 'relative',
    height: 160,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeReceiptButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(18, 32, 58, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  removeReceiptText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    color: colors.textWhite,
  },
  generalErrorBox: {
    backgroundColor: colors.coralBg,
    padding: 12,
    borderRadius: radii.sm,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 8,
  },
});
