import DummyApp from "@/applications/DummyApp";
import { Position, Size } from "@/types";
import { SiWikipedia } from "@icons-pack/react-simple-icons";
import { AppWindowIcon } from "lucide-react";
import React from "react";
import Wikipedia from "./Wikipedia";
import StartMenu from "./StartMenu";

export interface ApplicationDefinition {
  name: string;
  component: React.FC;
  icon: React.FC<React.ComponentProps<"svg">>;
  /**
   * Number of active windows allowed for this application
   * @defaultValue Infinity
   */
  instanceLimit?: number;
  /**
   * Default window size.
   * @defaultValue (500, 300)
   */
  defaultSize?: Size;
  /**
   * Default window position.
   * @defaultValue (100, 100)
   */
  defaultPosition?: Position;
  /**
   * @default true
   */
  draggable?: boolean;
  /**
   * @default true
   */
  resizable?: boolean;
  /**
   * @default true
   */
  showTitleBar?: boolean;
}

interface ApplicationsRegistry {
  definitions: Record<string, ApplicationDefinition>;
}
const applicationsRegistry: ApplicationsRegistry = {
  // application definition registry
  definitions: {
    wikipedia: {
      name: "Wikipedia",
      component: Wikipedia,
      icon: SiWikipedia,
    },
    "dummy-app": {
      name: "Dummy App",
      component: DummyApp,
      icon: AppWindowIcon,
    },
    "start-menu": {
      name: "Start Menu",
      component: StartMenu,
      icon: AppWindowIcon,
      resizable: false,
      draggable: false,
      showTitleBar: false,
      defaultPosition: { x: 0, y: 0 },
      defaultSize: { height: "100%", width: 300 },
      instanceLimit: 1,
    },
  },
};

export default applicationsRegistry;
