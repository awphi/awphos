import { SiWikipedia } from "@icons-pack/react-simple-icons";
import {
  AppWindowIcon,
  BookIcon,
  GamepadIcon,
  SettingsIcon,
  StickyNoteIcon,
  TerminalIcon,
} from "lucide-react";
import { type ComponentProps, type FC } from "react";
import Wikipedia from "./Wikipedia";
import StartMenu from "./StartMenu";
import TwentyFortyEight from "./TwentyFortyEight";
import { applyDefaults, deepFreeze } from "@/utils";
import type { HTMLMotionProps, TargetAndTransition } from "motion/react";
import SystemSettings from "./SystemSettings";
import StickyNote from "./StickyNote";
import type { ApplicationProps } from "@/store/applications";
import Terminal from "./Terminal";
import TerminalManual from "./Terminal/TerminalManual";

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
   * @default true
   */
  showInTaskbar?: boolean;
  /**
   * @default true
   */
  showInStartMenu?: boolean;
  /**
   * @default {}
   */
  windowProps?: HTMLMotionProps<"div">;
  /**
   * @default ['opacity', 'scale']
   */
  animatedProps?: (keyof TargetAndTransition)[];
  /**
   * @default {}
   */
  defaultProps?: Partial<ApplicationProps> | (() => Partial<ApplicationProps>);
}

const DEFAULT_DEFINITION: Required<ApplicationDefinition> = deepFreeze({
  name: "Unknown",
  component: () => null,
  icon: () => null,
  instanceLimit: Infinity,
  showInTaskbar: true,
  showInStartMenu: true,
  windowProps: {},
  animatedProps: ["scale", "opacity"],
  defaultProps: {},
});

export interface ApplicationsRegistry {
  definitions: Record<string, Required<ApplicationDefinition>>;
}

// TODO may need moving into redux state to support "installation" of custom applications at runtime
export const applicationsRegistry = deepFreeze<ApplicationsRegistry>({
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

        defaultProps: {
          size: {
            width: 720,
            height: 380,
          },
          minSize: {
            width: 380,
            height: 380,
          },
        },
      },
      "system-settings": {
        name: "System Settings",
        component: SystemSettings,
        instanceLimit: 1,
        icon: SettingsIcon,
      },
      "start-menu": {
        name: "Start Menu",
        component: StartMenu,
        icon: AppWindowIcon,
        showInTaskbar: false,
        showInStartMenu: false,
        instanceLimit: 1,
        windowProps: {
          className: "origin-bottom",
          style: { bottom: 0 },
        },
        defaultProps: {
          draggable: false,
          resizable: false,
          topLeft: {
            x: 0,
            y: 0,
          },
          size: { height: "60vh", width: "15vw" },
          minSize: { width: 300, height: "60vh" },
          showTitleBar: false,
        },
        animatedProps: ["opacity", "scaleY"],
      },
      "sticky-note": {
        name: "Sticky Note",
        component: StickyNote,
        icon: StickyNoteIcon,
        defaultProps: {
          minimizable: false,
          maximizable: false,
          size: {
            width: 300,
            height: 300,
          },
          minSize: {
            height: 300,
            width: 300,
          },
        },
      },
      terminal: {
        name: "Terminal",
        component: Terminal,
        icon: TerminalIcon,
      },
      "terminal-manual": {
        name: "Terminal Manual",
        component: TerminalManual,
        icon: BookIcon,
        defaultProps: {
          size: {
            width: 500,
            height: 400,
          },
        },
      },
    },
    DEFAULT_DEFINITION
  ),
});

export function getApplicationDefinition(
  id: string
): Required<ApplicationDefinition> {
  return applicationsRegistry.definitions[id] ?? DEFAULT_DEFINITION;
}

export function isValidApplicationDefinitionId(id: string): boolean {
  return id in applicationsRegistry.definitions;
}
