import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import axios from "axios";
import { LoginInputState, SignupInputState } from "@/schema/userSchema";
import { toast } from "sonner";

const API_END_POINT = "https://eatsonline-fyp.onrender.com/api/v1/user";

// Axios default
axios.defaults.withCredentials = true;

type User = {
  fullname: string;
  email: string;
  contact: number;
  address: string;
  city: string;
  country: string;
  profilePicture: string;
  admin: boolean;
  isVerified: boolean;
};

type UserState = {
  user: User | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  loading: boolean;
  signup: (input: SignupInputState) => Promise<void>;
  login: (input: LoginInputState) => Promise<void>;
  verifyEmail: (verificationCode: string) => Promise<void>;
  checkAuthentication: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (input: any) => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: true,
      loading: false,

      signup: async (input: SignupInputState) => {
        try {
          set({ loading: true });
          const response = await axios.post(`${API_END_POINT}/signup`, input, {
            headers: { "Content-Type": "application/json" },
          });

          if (response.data.success) {
            localStorage.setItem("auth-token", response.data.token);
            toast.success(response.data.message);
            set({
              loading: false,
              user: response.data.user,
              isAuthenticated: true,
            });
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Signup failed");
          set({ loading: false });
        }
      },

      login: async (input: LoginInputState) => {
        try {
          set({ loading: true });
          const response = await axios.post(`${API_END_POINT}/login`, input, {
            headers: { "Content-Type": "application/json" },
          });

          if (response.data.success) {
            localStorage.setItem("auth-token", response.data.token);
            toast.success(response.data.message);
            set({
              loading: false,
              user: response.data.user,
              isAuthenticated: true,
            });
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Login failed");
          set({ loading: false });
        }
      },

      verifyEmail: async (verificationCode: string) => {
        try {
          set({ loading: true });
          const response = await axios.post(
            `${API_END_POINT}/verify-email`,
            { verificationCode },
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.data.success) {
            localStorage.setItem("auth-token", response.data.token);
            toast.success(response.data.message);
            set({
              loading: false,
              user: response.data.user,
              isAuthenticated: true,
            });
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Verification failed");
          set({ loading: false });
        }
      },

      checkAuthentication: async () => {
        try {
          set({ isCheckingAuth: true });
          const token = localStorage.getItem("auth-token");
          if (!token) throw new Error("No token found");

          const response = await axios.get(`${API_END_POINT}/check-auth`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isCheckingAuth: false,
            });
          }
        } catch (error) {
          set({ isAuthenticated: false, isCheckingAuth: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true });
          const token = localStorage.getItem("auth-token");

          const response = await axios.post(
            `${API_END_POINT}/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success) {
            localStorage.removeItem("auth-token");
            toast.success(response.data.message);
            set({ loading: false, user: null, isAuthenticated: false });
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Logout failed");
          set({ loading: false });
        }
      },

      forgotPassword: async (email: string) => {
        try {
          set({ loading: true });
          const response = await axios.post(
            `${API_END_POINT}/forgot-password`,
            { email }
          );

          if (response.data.success) {
            toast.success(response.data.message);
            set({ loading: false });
          }
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || "Failed to send reset email"
          );
          set({ loading: false });
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        try {
          set({ loading: true });
          const response = await axios.post(
            `${API_END_POINT}/reset-password/${token}`,
            { newPassword }
          );

          if (response.data.success) {
            toast.success(response.data.message);
            set({ loading: false });
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Reset failed");
          set({ loading: false });
        }
      },

      updateProfile: async (input: any) => {
        try {
          const token = localStorage.getItem("auth-token");
          const response = await axios.put(
            `${API_END_POINT}/profile/update`,
            input,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success) {
            toast.success(response.data.message);
            set({ user: response.data.user, isAuthenticated: true });
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Update failed");
        }
      },
    }),
    {
      name: "user-name",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
