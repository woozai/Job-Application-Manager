export interface AccessToken {
  access_token: string;
  token_type: string;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}
