export type Token = "valid-token" | "invalid-token";

export interface Auth {
  id: string;
  email: string;
  password: string;
  token?: Token;
}

export const initAuth = {
  id: "",
  email: "",
  password: "",
  token: "invalid-token",
};
