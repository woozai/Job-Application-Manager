export interface ApiErrorPayload {
  detail?: string;
  message?: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ListQueryParams {
  skip?: number;
  limit?: number;
}
