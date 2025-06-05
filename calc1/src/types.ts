type buttonType = "NUMBER" | "OPERATOR" | "CALC" | "EQUAL" | "BACKSPACE";

export type inputType = {
  type: buttonType;
  val: string;
};

export type displayValType = inputType[];

export type historyType = [string, string][];
