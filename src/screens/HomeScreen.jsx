// src/screens/HomeScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, SafeAreaView, 
  StyleSheet, Alert, RefreshControl, Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = '@expenses';
const { width } = Dimensions.get('window');

// Category colors and icons
const CATEGORY_DATA = {
  '🍔 Food': { color: '#FF6B6B', icon: 'fast-food' },
  '🚗 Transport': { color: '#4ECDC4', icon: 'car' },
  '🛍️ Shopping': { color: '#A8E6CF', icon: 'cart' },
  '📄 Bills': { color: '#FF8A5C', icon: 'document-text' },
  '🎮 Fun': { color: '#6C5CE7', icon: 'game-controller' },
  '📌 Other': { color: '#A0A0A0', icon: 'ellipsis-horizontal' },
};

export default function HomeScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Load expenses
  const loadExpenses = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      // Sort by date (newest first)
      parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(parsed);
      const sum = parsed.reduce((s, e) => s + Number(e.amount), 0);
      setTotal(sum);
    } catch (e) { 
      console.error(e); 
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  // Delete expense
  const deleteExpense = (id) => {
    Alert.alert(
      'Delete Expense', 
      'Are you sure you want to remove this?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const updated = expenses.filter(e => e.id !== id);
            setExpenses(updated);
            const sum = updated.reduce((s, e) => s + Number(e.amount), 0);
            setTotal(sum);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          }
        }
      ]
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Individual expense item
  const renderItem = ({ item }) => {
    const catData = CATEGORY_DATA[item.category] || CATEGORY_DATA['📌 Other'];
    
    return (
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <View style={[styles.iconCircle, { backgroundColor: catData.color + '20' }]}>
            <Ionicons name={catData.icon} size={20} color={catData.color} />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemCategory}>{item.category}</Text>
            {item.description ? (
              <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
            ) : null}
            <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemAmount}>₱{Number(item.amount).toFixed(2)}</Text>
          <TouchableOpacity 
            onPress={() => deleteExpense(item.id)} 
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Empty state
  const EmptyState = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="cash-outline" size={60} color="#6C63FF" />
      </View>
      <Text style={styles.emptyTitle}>No expenses yet</Text>
      <Text style={styles.emptySub}>Track your spending by adding your first expense</Text>
      <TouchableOpacity 
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('Add')}
      >
        <Text style={styles.emptyBtnText}>Add Expense</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Lazy Spend</Text>
          <Text style={styles.headerSub}>Track effortlessly</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.expenseCount}>{expenses.length}</Text>
        </View>
      </View>

      {/* Total Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Spent</Text>
        <Text style={styles.totalAmount}>₱{total.toFixed(2)}</Text>
        <View style={styles.totalBottom}>
          <Text style={styles.totalCount}>{expenses.length} expenses</Text>
          <View style={styles.totalDot} />
          <Text style={styles.totalCount}>This month</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      {expenses.length > 0 && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Spending Breakdown</Text>
          <View style={styles.breakdownRow}>
            {Object.entries(
              expenses.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat, amt]) => (
              <View key={cat} style={styles.breakdownItem}>
                <Text style={styles.breakdownCat}>{cat}</Text>
                <Text style={styles.breakdownAmt}>₱{amt.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Expenses List */}
      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Add')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  headerSub: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  headerRight: {
    backgroundColor: '#6C63FF20',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expenseCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
  totalCard: {
    backgroundColor: '#6C63FF',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
    marginVertical: 4,
  },
  totalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  totalCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  totalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 8,
  },
  breakdown: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownCat: {
    fontSize: 12,
    color: '#666',
  },
  breakdownAmt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D2D',
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 100,
  },
  item: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 4,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  itemDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  itemDate: {
    fontSize: 11,
    color: '#BBB',
    marginTop: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2D2D',
    marginRight: 8,
  },
  deleteBtn: {
    padding: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6C63FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6C63FF15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});