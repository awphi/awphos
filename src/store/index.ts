import { configureStore } from "@reduxjs/toolkit";
import applicationsReducer from "./applications";

export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
  },
  devTools: process.env.NODE_ENV === "development",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
