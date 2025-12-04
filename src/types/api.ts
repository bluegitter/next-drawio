// API 响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

// 文件上传响应
export interface UploadResponse extends ApiResponse {
  data: {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  };
}

// 用户信息
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  lastLoginAt?: Date;
}