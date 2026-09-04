import api, {
  clearAccessToken,
  getAccessToken,
  refreshAccessToken,
  setAccessToken,
} from "./api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt?: string;
};

type LoginResponse = {
  message: string;
  accessToken: string;
  user: AuthUser;
};

type CurrentUserResponse = {
  success: boolean;
  user: AuthUser;
};

const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    setAccessToken(response.data.accessToken);

    return response.data.user;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<CurrentUserResponse>("/auth/me");

    return response.data.user;
  },

  async restoreSession(): Promise<AuthUser> {
    // If the page was completely reloaded and the
    // access token is unavailable, try the refresh cookie.
    if (!getAccessToken()) {
      await refreshAccessToken();
    }

    return this.getCurrentUser();
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAccessToken();
    }
  },
};

export default authService;
