import { configureStore } from "@reduxjs/toolkit";
import applicationsReducer, { applicationsMiddleware } from "./applications";

export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(applicationsMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
