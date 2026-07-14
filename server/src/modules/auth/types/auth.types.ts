export interface AccessTokenPayload {
  id: string;
  role: "USER" | "ADMIN";
}
export interface RefreshTokenPayload {
  id: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}
export interface LoginBody {
  email: string;
  password: string;
}
