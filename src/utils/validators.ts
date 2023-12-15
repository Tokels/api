import { uuidRegex } from "./regex";

export const validateID = (id: string) => {
  if (!id) {
    throw Error("Please provide auth ID as url params");
  }
  if (!uuidRegex.test(id)) {
    throw Error("Please provide valid ID");
  }
};
