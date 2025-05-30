import { forwardRef, useImperativeHandle } from "react";

const TestChild = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    test: () => {
      console.log("TestChild test method called");
    },
  }));
  return null;
});

export default TestChild;
