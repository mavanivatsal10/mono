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
  const [toggleFirst, setToggleFirst] = useState(true); // flag for setting proper subtitles
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

  const compute = (a: number | null, op: string | null, b: number) => {
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

  const getPrecision = (num: number | string) => {
    if (typeof num === "string") {
      num = Number(num);
      return Number(num.toFixed(12)).toString();
    } else {
      return Number(num.toFixed(12));
    }
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
    } else if ([...DIGITS, ".", "neg"].includes(prevBtnId)) {
      // we have prev and op set to non-null value
      const res = compute(prev, op, curr);
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(Number(res.toFixed(12)).toString());
        setCurr(res);
        setSubtitle(getPrecision(res) + " " + getSymbol(btnid) + " ");
        setPrev(res);
        setOp(btnid);
        setResetDisplay(true);
      }
    }
    setPrevBtnId(btnid);
  };

  const handleEqual = () => {
    if (/^.+\( .+ \)/.test(subtitle) && !/.+ = $/.test(subtitle)) {
      // matches sequence ...( ... )
      setSubtitle(`${subtitle} = `);
      if (prev !== null && op !== null) {
        const res = compute(prev, op, curr);
        if (res === null) {
          handleClear();
          setTitle("Cannot divide by zero");
        } else {
          setTitle(getPrecision(res).toString());
          setPrev(res);
          setResetDisplay(true);
        }
      }
    } else if (prevBtnId === null || prev === null || op === null) {
      setTitle(Number(title).toString());
      setSubtitle(Number(title).toString() + " = ");
      setCurr(Number(title));
      setResetDisplay(true);
    } else if (OPERATORS.includes(prevBtnId as string) || prevBtnId === "eq") {
      // we have prev and op set to non-null value
      const res = compute(prev, op, curr);
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(getPrecision(res).toString());
        setSubtitle(
          `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(curr)} = `
        );
        setPrev(res);
        setResetDisplay(true);
      }
    } else if ([...DIGITS, "."].includes(prevBtnId) || prevBtnId === "neg") {
      // we have prev and op set to non-null value
      const res = compute(prev, op, curr);
      if (res === null) {
        handleClear();
        setTitle("Cannot divide by zero");
      } else {
        setTitle(getPrecision(res).toString());
        setSubtitle(
          `${getPrecision(prev)} ${getSymbol(op)} ${getPrecision(curr)} = `
        );
        setPrev(res);
      }
    }
    setPrevBtnId("eq");
    setToggleFirst(true);
  };

  const handleToggleSign = () => {
    if (prevBtnId === null || [...DIGITS, "."].includes(prevBtnId)) {
      if (title === "0") return;
    } else if (prevBtnId === "eq") {
      setSubtitle(`negate( ${toggleFirst ? title : subtitle} )`);
    } else if (["neg", "inv", "sqr", "sqrt"].includes(prevBtnId)) {
      const splitSub = subtitle.split(" ");
      if (splitSub.length === 3) {
        setSubtitle(`negate( ${subtitle} )`);
      } else if (splitSub.length >= 5) {
        const [a, b, ...c] = splitSub;
        setSubtitle(`${a} ${b} negate( ${c.join(" ")} )`);
      }
    } else if (OPERATORS.includes(prevBtnId)) {
      setSubtitle(`${subtitle}negate( ${title} )`);
    }
    setTitle(title.includes("-") ? title.slice(1) : "-" + title);
    setCurr(-1 * curr);
    setToggleFirst(false);
    setPrevBtnId("neg");
  };

  const handleInverse = () => {
    if (title === "0") {
      handleClear();
      setTitle("Cannot divide by zero");
    } else if (
      prevBtnId === "eq" ||
      prevBtnId === null ||
      [...DIGITS, "."].includes(prevBtnId)
    ) {
      setSubtitle(`1/( ${toggleFirst ? title : subtitle} )`);
    } else if (["neg", "inv", "sqr", "sqrt"].includes(prevBtnId)) {
      const splitSub = subtitle.split(" ");
      if (splitSub.length === 3) {
        setSubtitle(`1/( ${subtitle} )`);
      } else if (splitSub.length >= 5) {
        const [a, b, ...c] = splitSub;
        setSubtitle(`${a} ${b} 1/( ${c.join(" ")} )`);
      }
    } else if (OPERATORS.includes(prevBtnId)) {
      setSubtitle(`${subtitle}1/( ${title} )`);
    }
    setTitle(getPrecision(1 / curr).toString());
    setCurr(1 / curr);
    setToggleFirst(false);
    setPrevBtnId("inv");
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
    } else if (btnid === "eq") {
      handleEqual();
    } else if (btnid === "backspace") {
      handleBackspace();
    } else if (OPERATORS.includes(btnid)) {
      handleOperator(btnid);
    } else if (btnid === "neg") {
      handleToggleSign();
    } else if (btnid === "inv") {
      handleInverse();
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
