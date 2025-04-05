import DummyApp from "@/applications/DummyApp";
import { Dimensions, Position } from "@/types";
import { SiWikipedia } from "@icons-pack/react-simple-icons";
import { AppWindowIcon } from "lucide-react";
import React from "react";
import Wikipedia from "./Wikipedia";

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
  defaultSize?: Dimensions;
  /**
   * Default window position.
   * @defaultValue (100, 100)
   */
  defaultPosition?: Position;
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
  },
};

export default applicationsRegistry;
