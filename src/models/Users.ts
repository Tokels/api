import { AuthId } from "./Auth";

export type Card = {
  id: AuthId;
  name: string;
  end_date: string;
  cvv: number;
  card_number: string;
  get_notified: boolean;
  color: "rose" | "violet" | "indigo" | "blue";
};

export interface UserPublic {}

export interface UserPrivate {
  id: AuthId;
  cards: Card[];
  card_groups: Card[][];
}

export interface UserDataPointers {
  id: AuthId;
  cards: AuthId[];
  card_groups: AuthId[][];
}

export interface DataPointers {
  public: UserPublic[];
  private: UserDataPointers[];
  cards: Card[];
}
