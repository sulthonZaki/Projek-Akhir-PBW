import { Role, StatusUser } from "@prisma/client";

export type UserSession = {
  id: number;
  username: string;
  namaLengkap: string;
  role: Role;
  status: StatusUser;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};