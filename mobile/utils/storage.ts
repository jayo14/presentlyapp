import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AttendanceRecord, Venue, LecturerCourse, Session, School } from '@/types';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@presently_auth_token',
  REFRESH_TOKEN: '@presently_refresh_token',
  USER: '@presently_user',
  ALL_USERS: '@presently_all_users',
  ONBOARDING_DONE: '@presently_onboarding',
  THEME: '@presently_theme',
  ATTENDANCE_QUEUE: '@presently_attendance_queue',
  VENUES: '@presently_venues',
  SCHOOLS: '@presently_schools',
  LECTURER_COURSES: '@presently_lecturer_courses',
  SESSIONS: '@presently_sessions',
} as const;

export const storage = {
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Also update in all users if exists
    const allUsers = await this.getAllUsers();
    const index = allUsers.findIndex(u => u.id === user.id);
    if (index >= 0) {
      allUsers[index] = user;
      await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
    }
  },

  async getUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  async setOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    const done = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
    return done === 'true';
  },

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  async getTheme(): Promise<'light' | 'dark' | null> {
    const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return theme as 'light' | 'dark' | null;
  },

  async queueAttendance(record: AttendanceRecord): Promise<void> {
    const queue = await this.getAttendanceQueue();
    queue.push(record);
    await AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE_QUEUE, JSON.stringify(queue));
  },

  async getAttendanceQueue(): Promise<AttendanceRecord[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE_QUEUE);
    return data ? JSON.parse(data) : [];
  },

  async clearAttendanceQueue(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE_QUEUE, JSON.stringify([]));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.ATTENDANCE_QUEUE,
      STORAGE_KEYS.VENUES,
      STORAGE_KEYS.SCHOOLS,
      STORAGE_KEYS.LECTURER_COURSES,
      STORAGE_KEYS.SESSIONS,
    ]);
  },

  // Admin: All Users
  async getAllUsers(): Promise<User[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ALL_USERS);
    return data ? JSON.parse(data) : [];
  },

  async saveUser(user: User): Promise<void> {
    const users = await this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  },

  async deleteUser(id: string): Promise<void> {
    const users = await this.getAllUsers();
    const filtered = users.filter(u => u.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(filtered));
  },

  // Venues
  async getVenues(): Promise<Venue[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.VENUES);
    return data ? JSON.parse(data) : [];
  },

  async saveVenue(venue: Venue): Promise<void> {
    const venues = await this.getVenues();
    const index = venues.findIndex(v => v.id === venue.id);
    if (index >= 0) {
      venues[index] = venue;
    } else {
      venues.push(venue);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(venues));
  },

  async deleteVenue(id: string): Promise<void> {
    const venues = await this.getVenues();
    const filtered = venues.filter(v => v.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(filtered));
  },

  // Institutions (Schools)
  async getSchools(): Promise<School[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHOOLS);
    return data ? JSON.parse(data) : [];
  },

  async saveSchool(school: School): Promise<void> {
    const schoolsList = await this.getSchools();
    const index = schoolsList.findIndex(s => s.id === school.id);
    if (index >= 0) {
      schoolsList[index] = school;
    } else {
      schoolsList.push(school);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schoolsList));
  },

  async deleteSchool(id: string): Promise<void> {
    const schoolsList = await this.getSchools();
    const filtered = schoolsList.filter(s => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(filtered));
  },

  // Lecturer Courses
  async getLecturerCourses(): Promise<LecturerCourse[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LECTURER_COURSES);
    return data ? JSON.parse(data) : [];
  },

  async saveLecturerCourse(course: LecturerCourse): Promise<void> {
    const courses = await this.getLecturerCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.LECTURER_COURSES, JSON.stringify(courses));
  },

  // Sessions
  async getSessions(): Promise<Session[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  async saveSession(session: Session): Promise<void> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },
  
  async deleteSession(id: string): Promise<void> {
    const sessions = await this.getSessions();
    const filtered = sessions.filter(s => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  },
};
