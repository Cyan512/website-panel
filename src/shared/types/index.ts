// Global shared types — contracts that cross feature boundaries
// Features should NOT import logic from other features, only types when necessary.

export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    image?: string;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
