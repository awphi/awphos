import { useContext } from "react";
import { useApplication } from "./useApplication";
import { WindowContext } from "@/components/Window/constants";

export default function useCurrentApplication() {
  const { applicationId } = useContext(WindowContext);
  return useApplication(applicationId);
}
