/**
 * SummaStudy Shared Type Definitions
 * Generated based on Domain-Driven Architecture
 */

// --- Enums ---

export enum SummaUserRole {
  ADMIN = 'ADMIN',
  LECTURER = 'LECTURER',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST',
}

export enum SummaResourceType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  MARKDOWN = 'MARKDOWN',
}

export enum SummaEnrollmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

export enum SummaTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum SummaMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

// --- Entities ---

export interface SummaInstitution {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, any>;
}

export interface SummaDepartment {
  id: string;
  institutionId: string;
  name: string;
}

export interface SummaCourse {
  id: string;
  code: string;
  title: string;
  departmentId: string;
}

export interface SummaCourseTopic {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface SummaResource {
  id: string;
  topicId?: string;
  ownerId: string;
  title: string;
  resourceType: SummaResourceType;
  filePath?: string;
  url?: string;
  content?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SummaCourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: SummaEnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
}

export interface SummaAISummary {
  id: string;
  resourceId?: string;
  topicId?: string;
  content: string;
  modelVersion: string;
  createdAt: string;
}

export interface SummaAIConversation {
  id: string;
  userId: string;
  contextResourceId?: string;
  title?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SummaAIMessage {
  id: string;
  conversationId: string;
  role: SummaMessageRole;
  content: string;
  timestamp: string;
}

export interface SummaLearningProgress {
  id: string;
  userId: string;
  topicId: string;
  completionPercentage: number;
  masteryScore: number;
  lastAccessed: string;
}

export interface SummaTutorialRoom {
  id: string;
  institutionId: string;
  name: string;
  capacity: number;
  locationDetails?: string;
  isActive: boolean;
}

export interface SummaTutorialBooking {
  id: string;
  roomId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface SummaBaseTask {
  id: string;
  userId: string;
  status: SummaTaskStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SummaUploadTask extends SummaBaseTask {
  fileName: string;
  progress: number;
  resourceId?: string;
}

// --- API Response Wrappers ---

export interface SummaApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

export interface SummaPaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}
