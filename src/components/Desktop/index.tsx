import useAppDispatch from "@/hooks/useAppDispatch";
import { openApplication } from "@/store/applications";
import { useEffect } from "react";

export default function Desktop() {
  const dispatch = useAppDispatch();

  // TODO temporary - remove
  useEffect(() => {
    dispatch(openApplication("dummy-app"));
  }, []);

  return <div className="w-full flex-auto"></div>;
}
