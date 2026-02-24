import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import Fonts from '@/constants/fonts';
import { useState } from 'react';

export default function CreateCourseScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    // TODO: Call API to create course
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Create Course</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
          placeholder="Course Title"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.primary }]}
          placeholder="Course Code"
          placeholderTextColor={colors.textSecondary}
          value={code}
          onChangeText={setCode}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>{loading ? 'Creating...' : 'Create Course'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.lexend.bold,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
});
