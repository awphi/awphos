import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CSSSize, Position } from "@/utils/positions";
import { assignSafe, removeFromArray } from "@/utils";
import { shallowEqual } from "react-redux";
import {
  getApplicationDefinition,
  isValidApplicationDefinitionId,
} from "@/applications";
import type mri from "mri";

/**
 * Mutable properties of a running application
 */
export interface ApplicationProps {
  title: string;
  size: CSSSize;
  minSize: CSSSize;
  topLeft: Position;
  maximized: boolean;
  minimized: boolean;
  draggable: boolean;
  resizable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  showTitleBar: boolean;
  args: ApplicationArgs;
  cwd: string;
}

// TODO could be a more specific type?
export type ApplicationArgs = mri.Argv;

/**
 * Instance of a running application
 */
export interface Application {
  definitionId: string;
  applicationId: string;
  props: ApplicationProps;
  state: "open" | "closing";
  parentId: string | null;
}

/**
 * Partial property updates to apply to given application
 */
export interface ApplicationPropsUpdate {
  applicationId: string;
  props: Partial<ApplicationProps>;
}

export interface ApplicationOpenArgs {
  definitionId: string;
  applicationId?: string;
  props?: Partial<ApplicationProps>;
  parentId?: string | null;
}

export const activeApplicationsSlice = createSlice({
  name: "applications",
  initialState: {
    applications: Object.create(null) as Record<string, Application>,
    focusQueue: [null] as (string | null)[],
  },
  reducers: {
    openApplication(state, { payload }: PayloadAction<ApplicationOpenArgs>) {
      const {
        definitionId,
        props: userProps = {},
        applicationId = crypto.randomUUID(),
      } = payload;
      if (!isValidApplicationDefinitionId(definitionId)) {
        throw new Error(`Unknown application definition ID: ${definitionId}`);
      }
      const def = getApplicationDefinition(definitionId);

      const currentApplications = Object.values(state.applications);
      const existingInstances = currentApplications.filter(
        (v) => v.definitionId === definitionId
      );

      if (existingInstances.length >= def.instanceLimit) {
        throw new Error(
          `Instance limit reached for application definition ID: ${definitionId}`
        );
      }

      const defaultProps =
        typeof def.defaultProps === "function"
          ? def.defaultProps()
          : def.defaultProps;
      // TODO could use applyDefaults + some deep cloning?
      const props = Object.assign<ApplicationProps, Partial<ApplicationProps>>(
        {
          title: def.name,
          maximized: false,
          minimized: false,
          minimizable: true,
          maximizable: true,
          resizable: true,
          draggable: true,
          showTitleBar: true,
          cwd: "/",
          args: {
            _: [],
          },
          ...defaultProps,
          topLeft: { ...(defaultProps.topLeft ?? { x: 50, y: 50 }) },
          size: { ...(defaultProps.size ?? { width: 500, height: 300 }) },
          minSize: {
            ...(defaultProps.minSize ?? { width: 250, height: 100 }),
          },
        },
        userProps
      );

      // prevent window overlap
      while (
        currentApplications.some((app) =>
          shallowEqual(props.topLeft, app.props.topLeft)
        )
      ) {
        props.topLeft.x += 20;
        props.topLeft.y += 20;
      }

      const app: Application = {
        applicationId,
        definitionId,
        props,
        state: "open",
        parentId: payload.parentId ?? null,
      };
      state.applications[app.applicationId] = app;
      state.focusQueue.push(app.applicationId);
    },
    startCloseApplication(state, { payload }: PayloadAction<string>) {
      if (payload in state.applications) {
        state.applications[payload].state = "closing";
      }

      for (const [id, app] of Object.entries(state.applications)) {
        if (app.parentId === payload) {
          // TODO apply recursively? 1 level deep may be good enough for now
          state.applications[id].state = "closing";
        }
      }
    },
    finalizeCloseApplication(state, { payload }: PayloadAction<string>) {
      if (payload in state.applications) {
        delete state.applications[payload];
        removeFromArray(state.focusQueue, payload);
      }
    },
    setApplicationProps(state, action: PayloadAction<ApplicationPropsUpdate>) {
      const {
        payload: { applicationId, props },
      } = action;

      if (applicationId in state.applications) {
        assignSafe(state.applications[applicationId].props, props);

        // always remove a minimized application from the focus queue
        if (props.minimized === true) {
          removeFromArray(state.focusQueue, applicationId);
        }
      }
    },
    focusApplication(state, { payload }: PayloadAction<string | null>) {
      if (payload === null || payload in state.applications) {
        removeFromArray(state.focusQueue, payload);
        state.focusQueue.push(payload);

        // always unminize an application when focusing it
        if (payload !== null && state.applications[payload].props.minimized) {
          state.applications[payload].props.minimized = false;
        }
      }
    },
  },
});

export const {
  openApplication,
  startCloseApplication,
  finalizeCloseApplication,
  setApplicationProps,
  focusApplication,
} = activeApplicationsSlice.actions;
export default activeApplicationsSlice.reducer;
