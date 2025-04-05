import { createContext } from "react";

export const WINDOW_CONTENT_CLASSNAME = "awphos-window-content";
export const TITLE_BAR_HEIGHT = 32;

export const WindowContext = createContext<{ applicationId: string }>({
  applicationId: "",
});
