import { ArrowLeft, Divide, History, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import Button from "./components/Button";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const OPERATORS = ["+", "-", "*", "/"];

export default function App() {
  const [title, setTitle] = useState("0"); // show result
  const [subtitle, setSubtitle] = useState(""); // show expression (a + b =)
  const [prev, setPrev] = useState<number | null>(null); // first operand
  const [op, setOp] = useState<string | null>(null); // operator
  const [curr, setCurr] = useState(0);
  const [resetDisplay, setResetDisplay] = useState(false);
  const [prevBtnId, setPrevBtnId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleDigit = (btnid: string) => {
    if (prevBtnId === "eq") {
      handleClear();
      setTitle(btnid);
      setCurr(Number(btnid));
    } else if (!prevBtnId || resetDisplay || title === "0") {
      setTitle(btnid);
      setCurr(Number(btnid));
      setResetDisplay(false);
    } else {
      setTitle(title + btnid);
      setCurr(Number(title + btnid));
    }
    setPrevBtnId(btnid);
  };

  const handleDecimal = () => {
    if (!prevBtnId || resetDisplay || title === "0" || title === "") {
      setTitle("0.");
      setCurr(0);
      setResetDisplay(false);
    } else if (!title.includes(".")) {
      setTitle(title + ".");
    }
    setPrevBtnId(".");
  };

  const handleClear = () => {
    setTitle("0");
    setSubtitle("");
    setPrev(null);
    setOp(null);
    setCurr(0);
    setResetDisplay(true);
    setPrevBtnId(null);
  };

  const handleClearEntry = () => {
    setTitle("0");
    setCurr(0);
  };

  const handleBackspace = () => {
    if (!prevBtnId || [...DIGITS, ".", "neg"].includes(prevBtnId)) {
      if (title.length === 1 || (title.length === 2 && title[0] === "-")) {
        setTitle("0");
      } else {
        setTitle(title.slice(0, -1));
      }
    }
    // } else if (prevBtnId === "eq") {
    //   setSubtitle("");
    //   setPrev(null);
    //   setOp(null);
    //   setResetDisplay(true);
    //   setPrevBtnId(null);
    // }
    setPrevBtnId("backspace");
  };

  const getSymbol = (operator: string) => {
    if (operator === "+" || operator === "-") return operator;
    else if (operator === "*") return "×";
    else if (operator === "/") return "÷";
  };

  const compute = () => {
    console.log("from compute function: ", prev, op, curr);
    let res = prev as number;

    if (op === "+") res += curr;
    else if (op === "-") res -= curr;
    else if (op === "*") res *= curr;
    else if (op === "/") {
      if (curr === 0) return null;
      res /= curr;
    }

    return res;
  };

  const handleOperator = (btnid: string) => {
    if (prevBtnId === "eq") {
      setSubtitle(Number(title).toString() + " " + getSymbol(btnid) + " ");
      setPrev(Number(title));
      setOp(btnid);
      setCurr(Number(title));
      setResetDisplay(true);
      setPrevBtnId(btnid);
    } else if (prevBtnId === null || prev === null || op === null) {
      setTitle(Number(title).toString());
      setSubtitle(Number(title).toString() + " " + getSymbol(btnid) + " ");
      setPrev(Number(title));
      setOp(btnid);
      setCurr(Number(title));
      setResetDisplay(true);
    } else if (OPERATORS.includes(prevBtnId)) {
      setOp(btnid);
      setSubtitle(Number(title).toString() + " " + getSymbol(btnid) + " ");
      setResetDisplay(true);
    } else if ([...DIGITS, "."].includes(prevBtnId)) {
      // we have prev and op set to non-null value
      const res = compute();
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(res.toString());
        setCurr(res);
        setSubtitle(res.toString() + " " + getSymbol(btnid) + " ");
        setPrev(res);
        setOp(btnid);
        setResetDisplay(true);
      }
    }
    setPrevBtnId(btnid);
  };

  // const handleToggleSign = () => {
  //   if (!prevBtnId || [...DIGITS, "."].includes(prevBtnId)) {
  //     if (title === "0") return;
  //     setTitle(title.includes("-") ? title.slice(1) : "-" + title);
  //   } else if (prevBtnId === "eq") {
  //     setTitle(title.includes("-") ? title.slice(1) : "-" + title);
  //     setSubtitle(`negate( ${subtitle} )`);
  //   }
  // };

  const handleEqual = () => {
    if (prevBtnId === null || prev === null || op === null) {
      setTitle(Number(title).toString());
      setSubtitle(Number(title).toString() + " = ");
      setCurr(Number(title));
      setResetDisplay(true);
    } else if (OPERATORS.includes(prevBtnId as string) || prevBtnId === "eq") {
      // we have prev and op set to non-null value
      const res = compute();
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(res.toString());
        setSubtitle(`${title} ${getSymbol(op)} ${curr} = `);
        setPrev(res);
        setResetDisplay(true);
      }
    } else if ([...DIGITS, "."].includes(prevBtnId)) {
      // we have prev and op set to non-null value
      console.log("inside!!");
      const res = compute();
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(res.toString());
        setSubtitle(`${prev} ${getSymbol(op)} ${curr} = `);
      }
    }
    setPrevBtnId("eq");
  };

  const processInput = (btnid: string) => {
    if (DIGITS.includes(btnid)) {
      handleDigit(btnid);
    } else if (btnid === ".") {
      handleDecimal();
    } else if (btnid === "c") {
      handleClear();
    } else if (btnid === "ce") {
      handleClearEntry();
    } else if (btnid === "backspace") {
      handleBackspace();
    } else if (OPERATORS.includes(btnid)) {
      handleOperator(btnid);
    } else if (btnid === "eq") {
      handleEqual();
      // } else if (btnid === "neg") {
      //   handleToggleSign();
    }
  };

  return (
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
        <div className="text-gray-300">{subtitle}</div>
        <div className="text-white text-3xl font-semibold text-right truncate">
          {title}
        </div>
        <div className="grid grid-cols-4 gap-1 mt-6">
          {[
            {
              displayVal: "%",
              btnid: "percent",
              variant: "dark",
            },
            {
              displayVal: "CE",
              btnid: "ce",
              variant: "dark",
            },
            {
              displayVal: "C",
              btnid: "c",
              variant: "dark",
            },
            {
              displayVal: <ArrowLeft />,
              btnid: "backspace",
              variant: "dark",
            },
            {
              displayVal: (
                <div className="text-xl">
                  <span>⅟</span>
                  <sub>x</sub>
                </div>
              ),
              btnid: "inv",
              variant: "dark",
            },
            {
              displayVal: (
                <div className="text-xl">
                  x<sup>2</sup>
                </div>
              ),
              btnid: "sqr",
              variant: "dark",
            },
            {
              displayVal: "√x",
              btnid: "sqrt",
              variant: "dark",
            },
            {
              displayVal: <Divide />,
              btnid: "/",
              variant: "dark",
            },
            {
              displayVal: "7",
              btnid: "7",
              variant: "light",
            },
            {
              displayVal: "8",
              btnid: "8",
              variant: "light",
            },
            {
              displayVal: "9",
              btnid: "9",
              variant: "light",
            },
            {
              displayVal: <X />,
              btnid: "*",
              variant: "dark",
            },
            {
              displayVal: "4",
              btnid: "4",
              variant: "light",
            },
            {
              displayVal: "5",
              btnid: "5",
              variant: "light",
            },
            {
              displayVal: "6",
              btnid: "6",
              variant: "light",
            },
            {
              displayVal: <Minus />,
              btnid: "-",
              variant: "dark",
            },
            {
              displayVal: "1",
              btnid: "1",
              variant: "light",
            },
            {
              displayVal: "2",
              btnid: "2",
              variant: "light",
            },
            {
              displayVal: "3",
              btnid: "3",
              variant: "light",
            },
            {
              displayVal: <Plus />,
              btnid: "+",
              variant: "dark",
            },

            {
              displayVal: <div className="text-xl">+/-</div>,
              btnid: "neg",
              variant: "light",
            },
            {
              displayVal: "0",
              btnid: "0",
              variant: "light",
            },
            {
              displayVal: ".",
              btnid: ".",
              variant: "light",
            },
            {
              displayVal: "=",
              btnid: "eq",
              variant: "orange",
            },
          ].map(({ displayVal, btnid, variant }) => (
            <Button
              displayVal={displayVal}
              onClick={() => processInput(btnid)}
              variant={variant as "dark" | "light" | "orange"}
              // ref={(e) => (buttonRefs.current[input.val] = e)}
              key={btnid}
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
  );
}
