import { openApplication, setApplicationProps } from "@/store/applications";
import TaskBarIcon from "./Icon";
import Image from "next/image";
import { useCallback, useEffect, useMemo, type MouseEvent } from "react";
import useAppDispatch from "@/hooks/useAppDispatch";

import logo from "../../../public/logo.png";
import { useApplication } from "@/hooks/useApplication";

export default function TaskBarStartMenuIcon() {
  const dispatch = useAppDispatch();
  const applicationId = useMemo(() => crypto.randomUUID(), []);
  const {
    application: { props },
    focus,
  } = useApplication(applicationId);

  useEffect(() => {
    dispatch(
      openApplication({
        definitionId: "start-menu",
        applicationId,
        props: { minimized: true },
      })
    );
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      dispatch(
        setApplicationProps({
          applicationId,
          props: { minimized: !props.minimized },
        })
      );

      if (props.minimized) {
        focus();
      }

      e.stopPropagation();
    },
    [applicationId, props.minimized]
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
