import { combineReducers, configureStore, createSlice } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  createTransform,
  persistCombineReducers,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage

const counterSlice = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
  },
});

const detailSlice = createSlice({
  name: "details",
  initialState: {
    name: "",
    age: 0,
  },
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setAge: (state, action) => {
      state.age = action.payload;
    },
  },
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    username: "",
    password: "",
  },
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
  },
});

// const onNameTransform = createTransform(
//   (inboundState) => {
//     return { name: inboundState.name };
//   },
//   (outboundState) => {
//     return { name: outboundState.name, age: 0 };
//   },
//   { whitelist: ["details"] }
// );

// const onlyUsernameTransform = createTransform(
//   (inboundState) => {
//     return { username: inboundState.username };
//   },
//   (outboundState) => {
//     return { username: outboundState.username, password: "" };
//   },
//   { whitelist: ["auth"] }
// );

// const rootConfig = {
//   key: "root",
//   storage,
//   transforms: [onNameTransform, onlyUsernameTransform],
// };

const rootReducer = combineReducers({
  counter: counterSlice.reducer,
  details: persistReducer(
    {
      key: "details",
      storage,
      blacklist: ["age"],
    },
    detailSlice.reducer
  ),
  auth: persistReducer(
    {
      key: "auth",
      storage,
      blacklist: ["password"],
    },
    authSlice.reducer
  ),
});

export const store = configureStore({
  reducer: persistReducer(
    {
      key: "root",
      storage,
      blacklist: ["auth", "details"],
    },
    rootReducer
  ),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
