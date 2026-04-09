import { apiBaseUrl } from "./config";

import type { ApiErrorPayload } from "../types/api";

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(message: string, status: number, payload: ApiErrorPayload | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | object | null;
  token?: string | null;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${apiBaseUrl}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function isBodyInit(value: RequestOptions["body"]): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof Blob
  );
}

function buildHeaders(body: RequestOptions["body"], token?: string | null, headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);

  if (token) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (body && !isBodyInit(body) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return nextHeaders;
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (response.status === 204) {
    return null;
  }

  return response.text();
}

function getErrorMessage(status: number, payload: unknown) {
  if (payload && typeof payload === "object") {
    const detail = "detail" in payload ? payload.detail : undefined;
    const message = "message" in payload ? payload.message : undefined;

    if (typeof detail === "string" && detail.length > 0) {
      return detail;
    }

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return `Request failed with status ${status}`;
}

export async function apiRequest<T>(
  path: string,
  { body, token, headers, ...init }: RequestOptions = {},
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: buildHeaders(body, token, headers),
    body: body == null ? undefined : isBodyInit(body) ? body : JSON.stringify(body),
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(response.status, payload),
      response.status,
      typeof payload === "object" && payload !== null ? (payload as ApiErrorPayload) : null,
    );
  }

  return payload as T;
}

export function createListQueryParams(skip?: number, limit?: number) {
  return { skip, limit };
}

export function createFormUrlEncodedBody(values: Record<string, string>) {
  const formBody = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    formBody.set(key, value);
  }

  return formBody;
}
