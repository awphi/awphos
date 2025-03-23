import DummyApp from "@/applications/DummyApp";
import { AppWindowIcon } from "lucide-react";
import React from "react";

export interface ApplicationDefinition {
  name: string;
  component: React.FC;
  icon: React.FC;
  /**
   * Number of active windows allowed for this application
   * @defaultValue Infinity
   */
  instanceLimit?: number;
  /**
   * Default window width when opening a new instance of this application
   * @defaultValue 700
   */
  defaultWidth?: number;
  /**
   * Default window height when opening a new instance of this application
   * @defaultValue 500
   */
  defaultHeight?: number;
}

interface ApplicationsRegistry {
  definitions: Record<string, ApplicationDefinition>;
}
const applicationsRegistry: ApplicationsRegistry = {
  // application definition registry
  definitions: {
    "dummy-app": {
      name: "Dummy App",
      component: DummyApp,
      icon: AppWindowIcon,
    },
  },
} as const;

export default applicationsRegistry;
