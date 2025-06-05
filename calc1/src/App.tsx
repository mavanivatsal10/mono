import { useState } from "react";
import type { displayValType, historyType, inputType } from "./types";

export default function App() {
  const [stack, setStack] = useState<displayValType>([
    { type: "NUMBER", val: "0" },
  ]);
  const [currVal, setCurrVal] = useState<inputType>({
    type: "NUMBER",
    val: "0",
  });
  const [history, setHistory] = useState<historyType>([]);
  const [equalButtonPressed, setEqualButtonPressed] = useState(false);

  const getString = (val: string) => {
    let x = Number(val).toString();
    // if (val.includes(".") && !x.includes(".")) {
    //   x = x + ".";
    // }
    return x;
  };

  const applyOperator = (a: number, b: number, op: string) => {
    let res = 0;
    if (op === "ADD") {
      res = a + b;
    } else if (op === "SUB") {
      res = a - b;
    } else if (op === "MUL") {
      res = a * b;
    } else if (op === "DIV") {
      res = a / b;
    }
    return res;
  };

  const processStack = () => {
    if (stack.length < 2) return currVal.val;
    const a = Number(stack[0].val);
    const b = Number(currVal.val);
    const result = applyOperator(a, b, stack[1].val);
    return result.toString();
  };

  // const processCalc = (num: number, input: string) => {
  //   let res = 0;
  //   if (input === "NEG") {
  //     res = num * -1;
  //   } else if (input === "INV") {
  //     res = 1 / num;
  //   } else if (input === "SQR") {
  //     res = num * num;
  //   } else if (input === "SQRT") {
  //     res = Math.sqrt(num);
  //   }
  //   return res;
  // };

  const processInput = (input: inputType) => {
    console.log("input", input);
    console.log("currVal", currVal);
    console.log("stack", stack);

    const helper1 = (a: string, b: string) => {
      if (a.includes(".") && b === ".") return a;
      return a + b;
    };

    setEqualButtonPressed(false);
    if (currVal.type === "NUMBER") {
      if (input.type === "NUMBER") {
        if (equalButtonPressed) {
          setCurrVal({ type: "NUMBER", val: input.val.toString() });
        } else {
          setCurrVal({
            type: "NUMBER",
            val: helper1(currVal.val.toString(), input.val.toString()),
          });
        }
      } else if (input.type === "OPERATOR") {
        const res = processStack();
        if (stack.length > 1) {
          setHistory([
            ...history,
            [
              getString(stack[0].val) +
                " " +
                getSymbol(stack[1].val) +
                " " +
                getString(currVal.val) +
                " = ",
              Number(res).toString(),
            ],
          ]);
        }
        setStack([
          { type: "NUMBER", val: res },
          { type: "OPERATOR", val: input.val },
        ]);
        setCurrVal({ type: "OPERATOR", val: input.val });
        // } else if (input.type === "CALC") {
        //   const res = processCalc(Number(currVal.val), input.val);
        //   setCurrVal({ type: "NUMBER", val: res.toString() });
      } else if (input.type === "BACKSPACE") {
        setCurrVal({
          type: "NUMBER",
          val: currVal.val.toString().slice(0, -1) || "0",
        });
      } else if (input.type === "EQUAL") {
        const res = processStack();
        setHistory([
          ...history,
          [
            stack.length > 1
              ? getString(stack[0].val) +
                " " +
                getSymbol(stack[1].val) +
                " " +
                getString(currVal.val) +
                " = "
              : getString(currVal.val) + " = ",
            Number(res).toString(),
          ],
        ]);
        setEqualButtonPressed(true);
        setCurrVal({ type: "NUMBER", val: res.toString() });
        setStack([]);
      }
    } else if (currVal.type === "OPERATOR") {
      if (input.type === "NUMBER") {
        setCurrVal({ type: "NUMBER", val: input.val });
      } else if (input.type === "OPERATOR") {
        setStack([stack[0], { type: "OPERATOR", val: input.val }]);
        // } else if (input.type === "CALC") {
        //   const res = processCalc(Number(stack[0].val), input.val);
        //   setCurrVal({ type: "NUMBER", val: res.toString() });
      } else if (input.type === "EQUAL") {
        const res = applyOperator(
          Number(stack[0].val),
          Number(stack[0].val),
          currVal.val
        );
        setHistory([
          ...history,
          [
            getString(stack[0].val) +
              " " +
              getSymbol(stack[1].val) +
              " " +
              getString(stack[0].val) +
              " = ",
            res.toString(),
          ],
        ]);
        setCurrVal({ type: "NUMBER", val: res.toString() });
        setStack([]);
      }
      // } else if (currVal.type === "CALC") {
      //   if (input.type === "NUMBER") {
      //     setCurrVal({ type: "NUMBER", val: input.val });
      //     setStack([]);
      //   }
    }
  };

  const getSymbol = (val: string) => {
    if (val === "ADD") return "+";
    if (val === "SUB") return "-";
    if (val === "MUL") return "*";
    if (val === "DIV") return "/";
  };

  return (
    <div>
      {Array.from({ length: 10 }, (_, i) => i).map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            processInput({ type: "NUMBER", val: i.toString() });
          }}
        >
          {i}
        </button>
      ))}
      <button
        type="button"
        onClick={() => processInput({ type: "OPERATOR", val: "ADD" })}
      >
        +
      </button>
      <button
        type="button"
        onClick={() => processInput({ type: "OPERATOR", val: "SUB" })}
      >
        -
      </button>
      <button
        type="button"
        onClick={() => processInput({ type: "OPERATOR", val: "MUL" })}
      >
        *
      </button>
      <button
        type="button"
        onClick={() => processInput({ type: "OPERATOR", val: "DIV" })}
      >
        /
      </button>
      <button
        type="button"
        onClick={() => processInput({ type: "NUMBER", val: "." })}
      >
        .
      </button>
      <br />
      {/* <button
        type="button"
        onClick={() => processInput({ type: "CALC", val: "NEG" })}
      >
        +/-
      </button>
      <br />
      <button
        type="button"
        onClick={() => processInput({ type: "CALC", val: "INV" })}
      >
        1/x
      </button>
      <br />
      <button
        type="button"
        onClick={() => processInput({ type: "CALC", val: "SQR" })}
      >
        x^2
      </button>
      <br />
      <button
        type="button"
        onClick={() => processInput({ type: "CALC", val: "SQRT" })}
      >
        rootx
      </button> */}
      <button
        type="button"
        onClick={() => processInput({ type: "EQUAL", val: "EQL" })}
      >
        =
      </button>
      <button
        type="button"
        onClick={() => processInput({ type: "BACKSPACE", val: "BKS" })}
      >
        {"<"}
      </button>
      <div>
        show1:{" "}
        {stack.length > 1
          ? getString(stack[0].val) + " " + getSymbol(stack[1].val)
          : history[history.length - 1]?.[0]}
      </div>
      <div>
        show2:{" "}
        {currVal.val !== "ADD" &&
        currVal.val !== "SUB" &&
        currVal.val !== "MUL" &&
        currVal.val !== "DIV"
          ? getString(currVal.val)
          : getString(stack[0].val)}
      </div>
      <ul>
        {history.map(([left, right], index) => (
          <li key={index}>
            {left} {right}
          </li>
        ))}
      </ul>
    </div>
  );
}
