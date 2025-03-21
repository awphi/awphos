"use client";

import Desktop from "@/components/Desktop";
import TaskBar from "@/components/TaskBar";
import { store } from "../store";
import { Provider } from "react-redux";
import Windows from "@/components/Windows";

export default function Home() {
  return (
    <Provider store={store}>
      <div className="w-full h-full flex flex-col">
        <Windows />
        <Desktop />
        <TaskBar />
      </div>
    </Provider>
  );
}
