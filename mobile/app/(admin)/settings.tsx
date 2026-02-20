import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Settings</Text>
      {/* Add your settings UI here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
