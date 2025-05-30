import { useDispatch, useSelector } from "react-redux";

function App() {
  const counter = useSelector((state) => state.counter);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Counter: {counter}</h1>
      <button onClick={() => dispatch({ type: "counter/increment" })}>
        Increment
      </button>
      <button onClick={() => dispatch({ type: "counter/decrement" })}>
        Decrement
      </button>
      <input
        type="text"
        name="name"
        onChange={(e) =>
          dispatch({
            type: "details/setName",
            payload: e.target.value,
          })
        }
      />
      name: {useSelector((state) => state.details.name)}
      <input
        type="number"
        name="age"
        onChange={(e) =>
          dispatch({
            type: "details/setAge",
            payload: e.target.value,
          })
        }
      />
      age: {useSelector((state) => state.details.age)}
      <input
        type="text"
        name="username"
        onChange={(e) =>
          dispatch({
            type: "auth/setUsername",
            payload: e.target.value,
          })
        }
      />
      username: {useSelector((state) => state.auth.username)}
      <input
        type="text"
        name="password"
        onChange={(e) =>
          dispatch({
            type: "auth/setPassword",
            payload: e.target.value,
          })
        }
      />
      password: {useSelector((state) => state.auth.password)}{" "}
    </div>
  );
}

export default App;
