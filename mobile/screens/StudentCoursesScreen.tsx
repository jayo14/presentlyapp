import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { 
  Search, 
  BookOpen, 
  Users, 
  Check, 
  ChevronRight, 
  Filter,
  ArrowLeft,
  Plus
} from 'lucide-react-native';
import { cn } from '../utils/cn';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Mock data
const ENROLLED_COURSES = [
  { id: 1, code: "MTH402", title: "Advanced Mathematics", semester: "First", units: 3, attendance: 85 },
  { id: 2, code: "CSC401", title: "Software Engineering", semester: "First", units: 4, attendance: 92 },
  { id: 3, code: "PHY201", title: "Physics II", semester: "First", units: 3, attendance: 68 },
  { id: 4, code: "ENG201", title: "Technical Writing", semester: "First", units: 2, attendance: 78 },
];

const AVAILABLE_COURSES = [
  { id: 5, code: "CSC403", title: "Artificial Intelligence", semester: "Second", units: 3, enrolled: 45, description: "Introduction to AI principles and applications." },
  { id: 6, code: "CSC405", title: "Database Systems", semester: "Second", units: 3, enrolled: 120, description: "Fundamentals of database design and management." },
  { id: 7, code: "GST201", title: "Peace and Conflict", semester: "Second", units: 2, enrolled: 500, description: "Study of peace and conflict resolution." },
];

export default function StudentCoursesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredEnrolled = ENROLLED_COURSES.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailable = AVAILABLE_COURSES.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center mt-6 mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">Courses</Text>
            <Text className="text-text-muted text-sm">Manage your academic curriculum</Text>
          </View>
        </View>

        {/* Search & Filter */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 relative">
            <TextInput
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 pl-10 text-white"
              placeholder="Search courses..."
              placeholderTextColor="#71717a"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <View className="absolute left-3 top-0 bottom-0 justify-center">
              <Search size={18} color="#71717a" />
            </View>
          </View>
          <TouchableOpacity className="bg-surface border border-border w-12 rounded-xl items-center justify-center">
            <Filter size={20} color="#C1B66D" />
          </TouchableOpacity>
        </View>

        {/* Custom Tabs */}
        <View className="flex-row bg-surface p-1 rounded-2xl mb-6 border border-border">
          <TouchableOpacity 
            onPress={() => setActiveTab('my')}
            className={cn(
              "flex-1 py-3 rounded-xl items-center",
              activeTab === 'my' ? "bg-zinc-800 shadow-sm" : ""
            )}
          >
            <Text className={cn(
              "font-bold text-sm",
              activeTab === 'my' ? "text-primary" : "text-text-muted"
            )}>My Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('available')}
            className={cn(
              "flex-1 py-3 rounded-xl items-center",
              activeTab === 'available' ? "bg-zinc-800 shadow-sm" : ""
            )}
          >
            <Text className={cn(
              "font-bold text-sm",
              activeTab === 'available' ? "text-primary" : "text-text-muted"
            )}>Available</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {activeTab === 'my' ? (
            <View className="gap-4 pb-10">
              {filteredEnrolled.map(course => (
                <TouchableOpacity 
                  key={course.id}
                  activeOpacity={0.7}
                  className="bg-surface border border-border p-5 rounded-3xl"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-4">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className="bg-primary/10 px-2 py-1 rounded-md">
                          <Text className="text-primary text-[10px] font-bold font-mono">{course.code}</Text>
                        </View>
                        <Text className="text-text-muted text-[10px] uppercase font-bold">{course.semester} Semester</Text>
                      </View>
                      <Text className="text-white font-bold text-lg">{course.title}</Text>
                    </View>
                    <View className="items-end">
                      <Text className={cn(
                        "text-lg font-bold",
                        course.attendance >= 75 ? "text-green-500" : "text-destructive"
                      )}>{course.attendance}%</Text>
                      <Text className="text-text-muted text-[10px] uppercase">Attendance</Text>
                    </View>
                  </View>

                  <View className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <View 
                      className={cn(
                        "h-full rounded-full",
                        course.attendance >= 75 ? "bg-green-500" : "bg-destructive"
                      )} 
                      style={{ width: `${course.attendance}%` }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between pt-2 border-t border-zinc-800/50">
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1.5">
                        <BookOpen size={14} color="#71717a" />
                        <Text className="text-text-muted text-xs">{course.units} Units</Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color="#3f3f46" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="gap-4 pb-10">
              {filteredAvailable.map(course => (
                <View 
                  key={course.id}
                  className="bg-surface border border-border p-5 rounded-3xl"
                >
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="bg-zinc-800 px-2 py-1 rounded-md">
                      <Text className="text-text-secondary text-[10px] font-bold font-mono">{course.code}</Text>
                    </View>
                    <Text className="text-text-muted text-[10px] uppercase font-bold">{course.semester} Semester</Text>
                  </View>

                  <Text className="text-white font-bold text-lg mb-2">{course.title}</Text>
                  <Text className="text-text-muted text-sm mb-4" numberOfLines={2}>
                    {course.description}
                  </Text>

                  <View className="flex-row items-center gap-4 mb-5">
                    <View className="flex-row items-center gap-1.5">
                      <BookOpen size={14} color="#71717a" />
                      <Text className="text-text-muted text-xs">{course.units} Units</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Users size={14} color="#71717a" />
                      <Text className="text-text-muted text-xs">{course.enrolled} Enrolled</Text>
                    </View>
                  </View>

                  <Button 
                    variant="outline" 
                    size="md"
                    className="w-full border-zinc-800"
                  >
                    <Plus size={18} color="#C1B66D" className="mr-2" />
                    Enroll in Course
                  </Button>
                </View>
              ))}
            </View>
          )}

          {((activeTab === 'my' && filteredEnrolled.length === 0) || (activeTab === 'available' && filteredAvailable.length === 0)) && (
            <View className="items-center justify-center py-20">
              <BookOpen size={64} color="#18181b" />
              <Text className="text-text-muted mt-4">No courses found matching your search</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
