import { setApplicationProps } from "@/store/applications";
import TaskBarIcon from "./Icon";
import Image from "next/image";
import { useCallback, type MouseEvent } from "react";
import useAppDispatch from "@/hooks/useAppDispatch";

import logo from "../../../public/logo.png";
import { useApplication } from "@/hooks/useApplication";

export default function TaskBarStartMenuIcon() {
  const dispatch = useAppDispatch();
  const {
    application: { props },
    focus,
  } = useApplication("start-menu");

  const handleClick = useCallback(
    (e: MouseEvent) => {
      dispatch(
        setApplicationProps({
          applicationId: "start-menu",
          props: { minimized: !props.minimized },
        })
      );

      if (props.minimized) {
        focus();
      }

      e.stopPropagation();
    },
    [props.minimized]
  );

  return (
    <TaskBarIcon onClick={handleClick}>
      <div
        title="Start"
        className="h-full aspect-square relative flex items-center justify-center"
      >
        <Image
          height={32}
          width={32}
          src={logo}
          alt="Logo image"
          sizes="100px"
        ></Image>
      </div>
    </TaskBarIcon>
  );
}
