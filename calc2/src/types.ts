type buttonType =
  | "NUMBER"
  | "OPERATOR"
  | "CALC"
  | "EQUAL"
  | "BACKSPACE"
  | "CLEAR"
  | "CLEARELEMENT";

export type inputType = {
  type: buttonType;
  val: string;
};

export type displayValType = inputType[];

export type historyType = [string, string][];
