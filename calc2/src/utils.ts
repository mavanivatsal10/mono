export const getSymbol = (operator: string) => {
  if (operator === "+" || operator === "-") return operator;
  else if (operator === "*") return "×";
  else if (operator === "/") return "÷";
};

export const compute = (a: number | null, op: string | null, b: number) => {
  let res = null;
  if (a === null || op === null) return null;

  if (op === "+") res = a + b;
  else if (op === "-") res = a - b;
  else if (op === "*") res = a * b;
  else if (op === "/") {
    if (b === 0) return null;
    res = a / b;
  }

  return res;
};

export const getPrecision = (num: number | string) => {
  if (typeof num === "string") {
    num = Number(num);
    return Number(num.toFixed(12)).toString();
  } else {
    return Number(num.toFixed(12));
  }
};
