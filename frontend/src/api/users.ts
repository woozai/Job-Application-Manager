import { apiRequest, createFormUrlEncodedBody } from "./client";

import type { ApiMessageResponse } from "../types/api";
import type {
  AccessToken,
  LoginCredentials,
  UserCreateInput,
  UserSummary,
  UserUpdateInput,
} from "../types/auth";

export function createUser(user: UserCreateInput) {
  return apiRequest<UserSummary>("/users/", {
    method: "POST",
    body: user,
  });
}

export function loginUser(credentials: LoginCredentials) {
  return apiRequest<AccessToken>("/users/token", {
    method: "POST",
    body: createFormUrlEncodedBody({
      username: credentials.email,
      password: credentials.password,
    }),
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<UserSummary>("/users/me", { token });
}

export function getUsers(token: string) {
  return apiRequest<UserSummary[]>("/users/", { token });
}

export function getUser(userId: number, token: string) {
  return apiRequest<UserSummary>(`/users/${userId}`, { token });
}

export function updateUser(userId: number, user: UserUpdateInput, token: string) {
  return apiRequest<UserSummary>(`/users/${userId}`, {
    method: "PUT",
    body: user,
    token,
  });
}

export function deleteUser(userId: number, token: string) {
  return apiRequest<ApiMessageResponse>(`/users/${userId}`, {
    method: "DELETE",
    token,
  });
}
