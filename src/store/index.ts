import { configureStore } from "@reduxjs/toolkit";
import applicationsReducer, { openApplication } from "./applications";

export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

store.dispatch(
  openApplication({
    definitionId: "start-menu",
    applicationId: "start-menu",
    props: { minimized: true },
  })
);
