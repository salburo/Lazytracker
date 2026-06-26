// src/screens/SettingsScreen.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, 
  StyleSheet, Alert, ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = '@expenses';

export default function SettingsScreen() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      setExpenses(parsed);
      const sum = parsed.reduce((s, e) => s + Number(e.amount), 0);
      setTotal(sum);
    } catch (e) {}
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expenses. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setExpenses([]);
            setTotal(0);
            Alert.alert('Done', 'All expenses have been cleared');
          }
        }
      ]
    );
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    const breakdown = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  };

  const formatCurrency = (amount) => `₱${amount.toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <Text style={styles.headerSub}>Manage your spending data</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{expenses.length}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(total)}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        {expenses.length > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Spending by Category</Text>
            {getCategoryBreakdown().map(([category, amount], index) => (
              <View key={index} style={styles.breakdownRow}>
                <Text style={styles.breakdownCat}>{category}</Text>
                <View style={styles.breakdownBarWrapper}>
                  <View 
                    style={[
                      styles.breakdownBar, 
                      { width: `${Math.min((amount / total) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.breakdownAmt}>{formatCurrency(amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={clearAll}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, styles.dangerIcon]}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </View>
              <Text style={styles.actionText}>Clear All Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, styles.actionItemLast]}
            onPress={loadData}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, styles.refreshIcon]}>
                <Ionicons name="refresh-outline" size={20} color="#6C63FF" />
              </View>
              <Text style={styles.actionText}>Refresh Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>📱 Lazy Spend</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            Track your expenses effortlessly. Built for lazy people who want to save money without the hassle.
          </Text>
          <View style={styles.aboutFooter}>
            <Text style={styles.aboutFooterText}>Made with ❤️ for lazy people</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  headerSub: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6C63FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownCat: {
    fontSize: 13,
    color: '#666',
    width: 80,
  },
  breakdownBarWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  breakdownAmt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2D2D',
    width: 70,
    textAlign: 'right',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D2D',
    padding: 16,
    paddingBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  actionItemLast: {
    borderBottomWidth: 0,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: '#FF3B3015',
  },
  refreshIcon: {
    backgroundColor: '#6C63FF15',
  },
  actionText: {
    fontSize: 15,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  aboutVersion: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  aboutDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  aboutFooter: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
    alignItems: 'center',
  },
  aboutFooterText: {
    fontSize: 12,
    color: '#CCC',
  },
});