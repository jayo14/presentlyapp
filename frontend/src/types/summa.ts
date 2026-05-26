/**
 * SummaStudy Shared Type Definitions
 * Generated based on Domain-Driven Architecture
 */

export type UUID = string;

// --- Enums ---

export enum UserRole {
  ADMIN = 'ADMIN',
  LECTURER = 'LECTURER',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST',
}

export enum ResourceType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  MARKDOWN = 'MARKDOWN',
}

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

// --- Entities ---

export interface Institution {
  id: UUID;
  name: string;
  slug: string;
  settings?: Record<string, any>;
}

export interface Department {
  id: UUID;
  institutionId: UUID;
  name: string;
}

export interface Course {
  id: UUID;
  code: string;
  title: string;
  departmentId: UUID;
}

export interface CourseTopic {
  id: UUID;
  courseId: UUID;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface Resource {
  id: UUID;
  topicId?: UUID;
  ownerId: UUID;
  title: string;
  resourceType: ResourceType;
  filePath?: string;
  url?: string;
  content?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: UUID;
  userId: UUID;
  courseId: UUID;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
}

export interface AISummary {
  id: UUID;
  resourceId?: UUID;
  topicId?: UUID;
  content: string;
  modelVersion: string;
  createdAt: string;
}

export interface AIConversation {
  id: UUID;
  userId: UUID;
  contextResourceId?: UUID;
  title?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: UUID;
  conversationId: UUID;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface LearningProgress {
  id: UUID;
  userId: UUID;
  topicId: UUID;
  completionPercentage: number;
  masteryScore: number;
  lastAccessed: string;
}

export interface TutorialRoom {
  id: UUID;
  institutionId: UUID;
  name: string;
  capacity: number;
  locationDetails?: string;
  isActive: boolean;
}

export interface TutorialBooking {
  id: UUID;
  roomId: UUID;
  userId: UUID;
  startTime: string;
  endTime: string;
  status: string;
}

export interface BaseTask {
  id: UUID;
  userId: UUID;
  status: TaskStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTask extends BaseTask {
  fileName: string;
  progress: number;
  resourceId?: UUID;
}

// --- API Response Wrappers ---

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
