import { useEffect, useRef, useState } from "react";
import type { displayValType, historyType, inputType } from "./types";
import Button from "./components/Button";
import { ArrowLeft, Divide, History, Minus, Plus, X } from "lucide-react";

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
  const [showHistory, setShowHistory] = useState(false);
  const [clearFlag, setClearFlag] = useState(false);

  function getString(input: string) {
    // If input starts with ".", prefix with "0"
    if (input.startsWith(".")) {
      input = "0" + input;
    }

    // If input is exactly "0." or starts with "0." followed by digits, keep it
    if (/^0\.\d*$/.test(input)) return input;

    // Remove leading zeros unless directly followed by a "."
    input = input.replace(/^0+(?!\.)/, "");

    // If input becomes empty or just ".", return "0"
    if (input === "") return "0";
    if (input === ".") return "0.";

    // If input is only zeros and dots (e.g., "000", "000.000"), simplify to "0"
    // if (/^0*\.?0*$/.test(input)) return "0";

    return input;
  }

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
    return Number(res.toFixed(10));
  };

  const processStack = () => {
    if (stack.length < 2) return currVal.val;
    const a = Number(stack[0].val);
    const b = Number(currVal.val);
    console.log(a, b);
    const result = applyOperator(a, b, stack[1].val);
    console.log(result);
    return result.toString();
  };

  const processCalc = (num: number, input: string) => {
    let res = 0;
    if (input === "NEG") {
      res = num * -1;
    } else if (input === "INV") {
      res = 1 / num;
    } else if (input === "SQR") {
      res = num * num;
    } else if (input === "SQRT") {
      res = Math.sqrt(num);
    }
    return res;
  };

  const processInput = (input: inputType) => {
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
        setClearFlag(false);
        const res = processStack();
        if (stack.length > 1) {
          setHistory([
            ...history,
            [
              Number(stack[0].val).toString() +
                " " +
                getSymbol(stack[1].val) +
                " " +
                Number(currVal.val).toString() +
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
      } else if (input.type === "CALC") {
        const res = processCalc(Number(currVal.val), input.val);
        if (input.val !== "NEG") {
          setHistory([
            ...history,
            [
              input.val.toLowerCase() + "(" + getString(currVal.val) + ") = ",
              res.toString(),
            ],
          ]);
        }
        setCurrVal({ type: "NUMBER", val: res.toString() });
      } else if (input.type === "BACKSPACE") {
        setCurrVal({
          type: "NUMBER",
          val: currVal.val.toString().slice(0, -1) || "0",
        });
      } else if (input.type === "EQUAL") {
        setClearFlag(false);
        const res = processStack();
        setHistory([
          ...history,
          [
            stack.length > 1
              ? Number(stack[0].val).toString() +
                " " +
                getSymbol(stack[1].val) +
                " " +
                Number(currVal.val).toString() +
                " = "
              : Number(currVal.val).toString() + " = ",
            Number(res).toString(),
          ],
        ]);
        setEqualButtonPressed(true);
        setCurrVal({ type: "NUMBER", val: Number(res).toString() });
        setStack([]);
      }
    } else if (currVal.type === "OPERATOR") {
      if (input.type === "NUMBER") {
        setCurrVal({ type: "NUMBER", val: input.val });
      } else if (input.type === "OPERATOR") {
        setStack([stack[0], { type: "OPERATOR", val: input.val }]);
      } else if (input.type === "CALC") {
        const res = processCalc(Number(stack[0].val), input.val);
        if (input.val !== "NEG") {
          setHistory([
            ...history,
            [
              input.val.toLowerCase() + "(" + getString(stack[0].val) + ") = ",
              res.toString(),
            ],
          ]);
        }
        setCurrVal({ type: "NUMBER", val: res.toString() });
      } else if (input.type === "EQUAL") {
        setClearFlag(false);
        setEqualButtonPressed(true);
        const res = applyOperator(
          Number(stack[0].val),
          Number(stack[0].val),
          currVal.val
        );
        setHistory([
          ...history,
          [
            Number(stack[0].val).toString() +
              " " +
              getSymbol(stack[1].val) +
              " " +
              Number(stack[0].val).toString() +
              " = ",
            res.toString(),
          ],
        ]);
        console.log(stack);
        setCurrVal({ type: "NUMBER", val: Number(res).toString() });
      }
    } else if (currVal.type === "CALC") {
      if (input.type === "NUMBER") {
        setCurrVal({ type: "NUMBER", val: input.val });
        setStack([]);
      }
    }
    if (input.type === "CLEARELEMENT") {
      // setStack([]);
      setCurrVal({ type: "NUMBER", val: "0" });
    } else if (input.type === "CLEAR") {
      setStack([]);
      setCurrVal({ type: "NUMBER", val: "0" });
      setClearFlag(true);
    }
  };

  const getSymbol = (val: string) => {
    if (val === "ADD") return "+";
    if (val === "SUB") return "-";
    if (val === "MUL") return "*";
    if (val === "DIV") return "/";
  };

  const buttonRefs = useRef({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        typeof document.activeElement.blur === "function"
      ) {
        document.activeElement.blur();
      }

      if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(e.key)) {
        buttonRefs.current[e.key]?.click();
      } else if (["+", "-", "*", "/"].includes(e.key)) {
        if (e.key === "+") buttonRefs.current["ADD"]?.click();
        else if (e.key === "-") buttonRefs.current["SUB"]?.click();
        else if (e.key === "*") buttonRefs.current["MUL"]?.click();
        else if (e.key === "/") buttonRefs.current["DIV"]?.click();
      } else if (e.key === "Enter") {
        buttonRefs.current["EQL"]?.click();
      } else if (e.key === "Backspace") {
        buttonRefs.current["BKS"]?.click();
      } else if (e.key === ".") {
        buttonRefs.current["."]?.click();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [buttonRefs]);

  return (
    <div>
      <div className="flex items-center justify-center bg-gray-100 h-screen gap-8">
        <div className="bg-gray-900 flex flex-col gap-1 p-4 text-right text-sm w-100">
          <div>
            <button
              className="text-gray-300 hover:bg-gray-700 rounded-full"
              type="button"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History />
            </button>
          </div>
          <div className="text-gray-300">
            {clearFlag
              ? null
              : stack.length > 1
              ? getString(stack[0].val) + " " + getSymbol(stack[1].val)
              : history[history.length - 1]?.[0]}
          </div>
          <div className="text-white text-3xl font-semibold text-right truncate">
            {currVal.val !== "ADD" &&
            currVal.val !== "SUB" &&
            currVal.val !== "MUL" &&
            currVal.val !== "DIV"
              ? getString(currVal.val)
              : getString(stack[0].val)}
          </div>
          <div className="grid grid-cols-4 gap-1 mt-6">
            {[
              {
                displayVal: "%",
                input: { type: "CALC", val: "PER" },
                variant: "dark",
              },
              {
                displayVal: "CE",
                input: { type: "CLEARELEMENT", val: "CLRE" },
                variant: "dark",
              },
              {
                displayVal: "C",
                input: { type: "CLEAR", val: "CLR" },
                variant: "dark",
              },
              {
                displayVal: <ArrowLeft />,
                input: { type: "BACKSPACE", val: "BKS" },
                variant: "dark",
              },
              {
                displayVal: (
                  <div className="text-xl">
                    <span>⅟</span>
                    <sub>x</sub>
                  </div>
                ),
                input: { type: "CALC", val: "INV" },
                variant: "dark",
              },
              {
                displayVal: (
                  <div className="text-xl">
                    x<sup>2</sup>
                  </div>
                ),
                input: { type: "CALC", val: "SQR" },
                variant: "dark",
              },
              {
                displayVal: "√x",
                input: { type: "CALC", val: "SQRT" },
                variant: "dark",
              },
              {
                displayVal: <Divide />,
                input: { type: "OPERATOR", val: "DIV" },
                variant: "dark",
              },
              {
                displayVal: "7",
                input: { type: "NUMBER", val: "7" },
                variant: "light",
              },
              {
                displayVal: "8",
                input: { type: "NUMBER", val: "8" },
                variant: "light",
              },
              {
                displayVal: "9",
                input: { type: "NUMBER", val: "9" },
                variant: "light",
              },
              {
                displayVal: <X />,
                input: { type: "OPERATOR", val: "MUL" },
                variant: "dark",
              },
              {
                displayVal: "4",
                input: { type: "NUMBER", val: "4" },
                variant: "light",
              },
              {
                displayVal: "5",
                input: { type: "NUMBER", val: "5" },
                variant: "light",
              },
              {
                displayVal: "6",
                input: { type: "NUMBER", val: "6" },
                variant: "light",
              },
              {
                displayVal: <Minus />,
                input: { type: "OPERATOR", val: "SUB" },
                variant: "dark",
              },
              {
                displayVal: "1",
                input: { type: "NUMBER", val: "1" },
                variant: "light",
              },
              {
                displayVal: "2",
                input: { type: "NUMBER", val: "2" },
                variant: "light",
              },
              {
                displayVal: "3",
                input: { type: "NUMBER", val: "3" },
                variant: "light",
              },
              {
                displayVal: <Plus />,
                input: { type: "OPERATOR", val: "ADD" },
                variant: "dark",
              },

              {
                displayVal: <div className="text-xl">+/-</div>,
                input: { type: "CALC", val: "NEG" },
                variant: "light",
              },
              {
                displayVal: "0",
                input: { type: "NUMBER", val: "0" },
                variant: "light",
              },
              {
                displayVal: ".",
                input: { type: "NUMBER", val: "." },
                variant: "light",
              },
              {
                displayVal: "=",
                input: { type: "EQUAL", val: "EQL" },
                variant: "orange",
              },
            ].map(({ displayVal, input, variant }) => (
              <Button
                displayVal={displayVal}
                input={input}
                processInput={processInput}
                variant={variant}
                ref={(e) => (buttonRefs.current[input.val] = e)}
                key={input.val}
              />
            ))}
          </div>
        </div>
        {showHistory && (
          <div className="bg-white w-100 h-150 p-4 text-gray-800 shadow-md rounded-lg overflow-y-auto">
            {history.map(([left, right], index) => (
              <div key={index}>
                <span>{left}</span>
                <span>{right}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
