// src/screens/AddScreen.jsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, 
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = '@expenses';

const CATEGORIES = [
  { id: 'food', label: '🍔 Food' },
  { id: 'transport', label: '🚗 Transport' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'bills', label: '📄 Bills' },
  { id: 'fun', label: '🎮 Fun' },
  { id: 'other', label: '📌 Other' },
];

export default function AddScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveExpense = async () => {
    // Validation
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const expenses = data ? JSON.parse(data) : [];
      
      const newExpense = {
        id: Date.now().toString(),
        amount: Number(amount),
        category: selectedCategory.label,
        description: description.trim(),
        date: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newExpense, ...expenses]));
      
      Alert.alert(
        'Success!', 
        'Expense added successfully',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setAmount('');
              setDescription('');
              setIsSubmitting(false);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save expense');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Expense</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.form}>
            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (₱)</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholderTextColor="#CCC"
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catBtn,
                      selectedCategory.id === cat.id && styles.catBtnActive
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.catEmoji}>{cat.label.split(' ')[0]}</Text>
                    <Text style={[
                      styles.catText,
                      selectedCategory.id === cat.id && styles.catTextActive
                    ]}>
                      {cat.label.split(' ')[1] || cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description <Text style={styles.optional}>(Optional)</Text></Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What did you spend on?"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#CCC"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
              onPress={saveExpense}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    color: '#999',
    fontSize: 13,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6C63FF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#2D2D2D',
    paddingVertical: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catBtn: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    marginBottom: 10,
  },
  catBtnActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  catEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  catText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  catTextActive: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    minHeight: 48,
    color: '#2D2D2D',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  saveBtn: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});