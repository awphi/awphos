"use client";

import Desktop from "@/components/Desktop";
import TaskBar from "@/components/TaskBar";
import { store } from "../store";
import { Provider } from "react-redux";
import Image from "next/image";
import { useFocus } from "@/hooks/useFocus";

// TODO more wallpapers once we have user preferences system
import wallpaperMountain1 from "../../public/wallpapers/mountain-1.jpg";

function HomeContent() {
  const { focus } = useFocus();

  return (
    <>
      <Image
        className=" -z-50 pointer-events-none"
        alt="Wallpaper image"
        fill
        sizes="100vw"
        style={{
          objectFit: "cover",
        }}
        src={wallpaperMountain1}
      ></Image>
      <div
        className="w-full h-full flex flex-col"
        onClick={() => focus(null)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Desktop />
        <TaskBar />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <HomeContent />
    </Provider>
  );
}
