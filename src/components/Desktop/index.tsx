import useAppDispatch from "@/hooks/useAppDispatch";
import { openApplication } from "@/store/applications";
import clsx from "clsx";
import { useEffect } from "react";

export default function Desktop(props: React.ComponentProps<"div">) {
  const dispatch = useAppDispatch();

  // TODO temporary - remove
  useEffect(() => {
    dispatch(openApplication("dummy-app"));
  }, []);

  return (
    <div
      {...props}
      className={clsx(props.className, "w-full flex-auto relative")}
    >
      {props.children}
    </div>
  );
}
