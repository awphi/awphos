import { configureStore } from "@reduxjs/toolkit";
import applicationsReducer, { openApplication } from "./applications";

export const store = configureStore({
  reducer: {
    applications: applicationsReducer,
  },
  devTools: process.env.NODE_ENV === "development",
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

store.dispatch(
  openApplication({
    definitionId: "sticky-note",
    applicationId: "welcome-note",
    props: {
      size: {
        height: 460,
        width: 300,
      },
      title: "Sticky Note - Welcome!",
    },
  })
);
