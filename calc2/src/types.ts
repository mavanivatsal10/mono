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

export type GlobalContextType = {
  constants: { DIGITS: string[]; OPERATORS: string[] };
  state: {
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    subtitle: string;
    setSubtitle: React.Dispatch<React.SetStateAction<string>>;
    prev: number | null;
    setPrev: React.Dispatch<React.SetStateAction<number | null>>;
    op: string | null;
    setOp: React.Dispatch<React.SetStateAction<string | null>>;
    curr: number;
    setCurr: React.Dispatch<React.SetStateAction<number>>;
    resetDisplay: boolean;
    setResetDisplay: React.Dispatch<React.SetStateAction<boolean>>;
    prevBtnId: string | null;
    setPrevBtnId: React.Dispatch<React.SetStateAction<string | null>>;
    toggleFirst: boolean;
    setToggleFirst: React.Dispatch<React.SetStateAction<boolean>>;
    history: string[];
    setHistory: React.Dispatch<React.SetStateAction<string[]>>;
    showHistory: boolean;
    setShowHistory: React.Dispatch<React.SetStateAction<boolean>>;
  };
};
