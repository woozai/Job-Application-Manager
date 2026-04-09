export interface AccessToken {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
}
