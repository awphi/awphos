import DummyApp from "@/applications/DummyApp";
import React from "react";

export interface ApplicationDefinition {
  name: string;
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
  component?: React.FC;
}

interface ApplicationsRegistry {
  definitions: Record<string, ApplicationDefinition>;
  hasComponent(definitionId: string): boolean;
  getComponent(definitionId: string): React.FC;
}
const applications: ApplicationsRegistry = {
  // application definition registry
  definitions: {
    "dummy-app": {
      name: "Dummy App",
      component: DummyApp,
    },
  },
  // helper methods
  hasComponent(id: string) {
    return applications.definitions[id].component !== undefined;
  },
  getComponent(id: string) {
    return applications.definitions[id].component ?? React.Fragment;
  },
} as const;

export default applications;
