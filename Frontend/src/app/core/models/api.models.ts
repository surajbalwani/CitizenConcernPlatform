// API Models matching backend DTOs exactly

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  region?: string;
  ward?: string;
  role?: UserRole;
  department?: string;
  phoneNumber?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  region?: string;
  ward?: string;
  role: UserRole;
  department?: string;
  isVerified: boolean;
  phoneNumber?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export enum UserRole {
  Citizen = 1,
  Officer = 2,
  DepartmentHead = 3,
  Admin = 4,
  SuperAdmin = 5,
}

export interface Category {
  name: string;
  description: string;
  subCategories: string[];
  icon: string;
  color: string;
}

// Concern Models
export interface Concern {
  id: number;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  priority: number;
  urgency: number;
  impact: number;
  status: ConcernStatus;
  location?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  region?: string;
  ward?: string;
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  assignedDepartment?: string;
  assignedOfficer?: string;
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
  isAnonymous: boolean;
  tags: string[];
  attachmentUrls: string[];
  sentimentScore: number;
  language: string;
  upVotes: number;
  downVotes: number;
  updates: ConcernUpdate[];
  comments: ConcernComment[];
}

export enum ConcernStatus {
  New = 1,
  Acknowledged = 2,
  InProgress = 3,
  UnderReview = 4,
  Resolved = 5,
  Closed = 6,
  Rejected = 7,
}

export interface ConcernUpdate {
  id: number;
  concernId: number;
  updateText: string;
  status: ConcernStatus;
  updatedBy: string;
  updatedAt: Date;
}

export interface ConcernComment {
  id: number;
  concernId: number;
  commentText: string;
  commentBy: string;
  isOfficial: boolean;
  createdAt: Date;
}

export interface CreateConcernRequest {
  title: string;
  description: string;
  address?: string;
  region?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  isAnonymous: boolean;
  language?: string;
  attachmentUrls?: string[];
}

export interface UpdateStatusRequest {
  status: ConcernStatus;
  updateText?: string;
  assignedDepartment?: string;
  assignedOfficer?: string;
  resolutionNotes?: string;
}

export interface VoteRequest {
  isUpVote: boolean;
}

export interface AddCommentRequest {
  commentText: string;
  commentBy: string;
  isOfficial: boolean;
}

// Analytics Models
export interface ConcernAnalytics {
  totalConcerns: number;
  newConcerns: number;
  inProgressConcerns: number;
  resolvedConcerns: number;
  closedConcerns: number;
  averageResolutionTime?: number;
  concernsByCategory: { [key: string]: number };
  concernsByRegion: { [key: string]: number };
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  region?: string;
  search?: string;
}

// Department Models
export interface Department {
  id: number;
  name: string;
  description?: string;
  headOfficerId?: string;
  responsibleCategories: string[];
  isActive: boolean;
  createdAt: Date;
}

// Notification Models
export interface UserNotification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  relatedConcernId?: number;
}

export enum NotificationType {
  ConcernUpdate = 1,
  StatusChange = 2,
  NewAssignment = 3,
  System = 4,
  Reminder = 5,
}

// Common API Response
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: string[];
  success: boolean;
}

// Error Response
export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
  status?: number;
}
