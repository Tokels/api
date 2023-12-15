export type AuthId = string;

export interface Auth {
  id: AuthId;
  email: string;
  password: string;
}

export const initAuth = {
  id: "",
  email: "",
  password: "",
};
