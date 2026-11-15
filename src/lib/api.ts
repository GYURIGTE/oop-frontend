import type {
  ApiConversation,
  ApiListing,
  ApiMeetup,
  ApiMessage,
  ApiUser,
  AuthPayload,
  ForgotPasswordInput,
  ListingInput,
  LoginInput,
  MeetupInput,
  Paginated,
  ProfileInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/types";

export const API_BASE = (
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const TOKEN_KEY = "baligya.token";

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage failures (private mode, etc.).
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** First validation message for a field, if any. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

type Envelope<T> = { data: T };

async function request<T>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();

  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: payload,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the BALIGYA server. Make sure the API is running.",
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let parsed: unknown = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const data = (parsed ?? {}) as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    throw new ApiError(
      data.message ?? `Request failed (${response.status}).`,
      response.status,
      data.errors ?? {},
    );
  }

  return parsed as T;
}

/** Unwrap a single `{ data: ... }` resource envelope. */
async function requestData<T>(path: string, options?: RequestOptions) {
  const result = await request<Envelope<T>>(path, options);
  return result.data;
}

/** Unwrap a paginated resource collection. */
async function requestPage<T>(path: string, options?: RequestOptions) {
  return request<Paginated<T>>(path, options);
}

function toFormData(
  values: Record<string, unknown>,
  files?: { images?: File[]; avatar?: File | null },
): FormData {
  const form = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => form.append(`${key}[]`, String(item)));
      continue;
    }

    form.append(key, String(value));
  }

  files?.images?.forEach((file) => form.append("images[]", file));

  if (files?.avatar) form.append("avatar", files.avatar);

  return form;
}

export const api = {
  auth: {
    login: (input: LoginInput) =>
      request<AuthPayload>("/auth/login", {
        method: "POST",
        body: { ...input, device_name: input.device_name ?? "baligya-web" },
      }),

    register: (input: RegisterInput) =>
      request<AuthPayload>("/auth/register", {
        method: "POST",
        body: { ...input, device_name: input.device_name ?? "baligya-web" },
      }),

    me: () => requestData<ApiUser>("/auth/me"),

    logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

    forgotPassword: (input: ForgotPasswordInput) =>
      request<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: input,
      }),

    resetPassword: (input: ResetPasswordInput) =>
      request<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: input,
      }),
  },

  market: {
    list: (params: Record<string, string | number | undefined> = {}) => {
      const query = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") query.set(key, String(value));
      }

      const suffix = query.toString() ? `?${query.toString()}` : "";

      return requestPage<ApiListing>(`/market${suffix}`);
    },

    get: (id: string | number) => requestData<ApiListing>(`/market/${id}`),
  },

  listings: {
    list: (params: Record<string, string | undefined> = {}) => {
      const query = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value) query.set(key, value);
      }

      const suffix = query.toString() ? `?${query.toString()}` : "";

      return requestPage<ApiListing>(`/listings${suffix}`);
    },

    get: (id: string | number) => requestData<ApiListing>(`/listings/${id}`),

    create: (input: ListingInput) =>
      requestData<ApiListing>("/listings", {
        method: "POST",
        body: toFormData(
          {
            name: input.name,
            category: input.category,
            description: input.description,
            price: input.price,
            condition: input.condition,
            location: input.location,
            status: input.status,
          },
          { images: input.images },
        ),
      }),

    update: (id: string | number, input: Partial<ListingInput>) =>
      requestData<ApiListing>(`/listings/${id}`, {
        method: "POST",
        body: (() => {
          const form = toFormData(
            {
              name: input.name,
              category: input.category,
              description: input.description,
              price: input.price,
              condition: input.condition,
              location: input.location,
              status: input.status,
            },
            { images: input.images },
          );

          form.append("_method", "PUT");
          input.removedImageIds?.forEach((imageId) =>
            form.append("removed_image_ids[]", String(imageId)),
          );

          return form;
        })(),
      }),

    remove: (id: string | number) =>
      request<void>(`/listings/${id}`, { method: "DELETE" }),
  },

  conversations: {
    list: () => requestData<ApiConversation[]>("/conversations"),

    get: (id: string | number) =>
      requestData<ApiConversation>(`/conversations/${id}`),

    start: (listingId: string | number) =>
      requestData<ApiConversation>("/conversations", {
        method: "POST",
        body: { listing_id: listingId },
      }),

    remove: (id: string | number) =>
      request<void>(`/conversations/${id}`, { method: "DELETE" }),
  },

  messages: {
    list: (conversationId: string | number, afterId?: number) => {
      const suffix = afterId ? `?after_id=${afterId}` : "";

      return requestData<ApiMessage[]>(
        `/conversations/${conversationId}/messages${suffix}`,
      );
    },

    send: (conversationId: string | number, body: string) =>
      requestData<ApiMessage>(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { body },
      }),
  },

  meetups: {
    list: (conversationId: string | number) =>
      requestData<ApiMeetup[]>(`/conversations/${conversationId}/meetups`),

    propose: (conversationId: string | number, input: MeetupInput) =>
      requestData<ApiMeetup>(`/conversations/${conversationId}/meetups`, {
        method: "POST",
        body: input,
      }),

    update: (meetupId: string | number, status: ApiMeetup["status"]) =>
      requestData<ApiMeetup>(`/meetups/${meetupId}`, {
        method: "PATCH",
        body: { status },
      }),
  },

  profile: {
    get: () => requestData<ApiUser>("/profile"),

    update: (input: ProfileInput) =>
      requestData<ApiUser>("/profile", {
        method: "POST",
        body: (() => {
          const form = toFormData(
            {
              first_name: input.first_name,
              last_name: input.last_name,
              email: input.email,
              username: input.username,
              phone: input.phone,
              bio: input.bio,
              location: input.location,
            },
            { avatar: input.avatar },
          );

          // PHP only parses multipart bodies for POST, so spoof the verb.
          form.append("_method", "PATCH");

          return form;
        })(),
      }),

    changePassword: (input: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) =>
      request<{ message: string }>("/profile/password", {
        method: "POST",
        body: input,
      }),

    destroy: (password: string) =>
      request<void>("/profile", { method: "DELETE", body: { password } }),
  },
};
