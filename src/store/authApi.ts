import { api } from "./api";

export interface User {
  _id: string;
  email: string;
  name: string;
  company?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  timezone?: string;
  workHours?: {
    start: string;
    end: string;
  };
  workingDays?: string[];
  apiKey?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  company?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/users/register",
        method: "POST",
        body: userData,
      }),
    }),

    getProfile: builder.query<User, void>({
      query: () => "/users/profile",
      transformResponse: (response: { success: boolean; user: User }) =>
        response.user,
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: "/users/profile",
        method: "PUT",
        body: userData,
      }),
      transformResponse: (response: { success: boolean; user: User }) =>
        response.user,
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<
      void,
      { currentPassword: string; newPassword: string }
    >({
      query: (passwordData) => ({
        url: "/users/change-password",
        method: "PUT",
        body: passwordData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
