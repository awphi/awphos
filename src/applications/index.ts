import DummyApp from "@/applications/DummyApp";
import type { Position, Size } from "@/types";
import { SiWikipedia } from "@icons-pack/react-simple-icons";
import { AppWindowIcon, GamepadIcon } from "lucide-react";
import { type ComponentProps, type FC } from "react";
import Wikipedia from "./Wikipedia";
import StartMenu from "./StartMenu";
import TwentyFortyEight from "./TwentyFortyEight";
import { applyDefaults, deepFreeze } from "@/utils";

export interface ApplicationDefinition {
  name: string;
  component: FC;
  icon: FC<ComponentProps<"svg">>;
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
  /**
   * @default true
   */
  showInTaskbar?: boolean;
  /**
   * @default true
   */
  showInStartMenu?: boolean;
  /**
   * @defaultValue (250, 100)
   */
  minSize?: Size;
}

const DEFAULT_DEFINITION: Required<ApplicationDefinition> = {
  name: "Unknown",
  component: () => null,
  icon: () => null,
  instanceLimit: Infinity,
  defaultSize: {
    width: 500,
    height: 300,
  },
  defaultPosition: {
    x: 100,
    y: 100,
  },
  draggable: true,
  resizable: true,
  showTitleBar: true,
  showInTaskbar: true,
  showInStartMenu: true,
  minSize: {
    width: 250,
    height: 100,
  },
};

export interface ApplicationsRegistry {
  definitions: Record<string, Required<ApplicationDefinition>>;
}

const applicationsRegistry = deepFreeze<ApplicationsRegistry>({
  definitions: applyDefaults<ApplicationDefinition>(
    {
      wikipedia: {
        name: "Wikipedia",
        component: Wikipedia,
        icon: SiWikipedia,
      },
      "2048": {
        name: "2048",
        component: TwentyFortyEight,
        icon: GamepadIcon,
        defaultSize: {
          width: 380,
          height: 380,
        },
        minSize: {
          width: 380,
          height: 380,
        },
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
        showInTaskbar: false,
        showInStartMenu: false,
        defaultPosition: { x: 0, y: 0 },
        defaultSize: { height: "100%", width: 300 },
        instanceLimit: 1,
      },
    },
    DEFAULT_DEFINITION
  ),
});

export default applicationsRegistry;
