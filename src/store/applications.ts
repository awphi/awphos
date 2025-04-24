import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import applicationsRegistry from "../applications";
import type { Size, Position } from "@/types";
import { assignSafe, removeFromArray } from "@/utils";
import { shallowEqual } from "react-redux";

/**
 * Mutable properties of a running application
 */
export interface ApplicationProps {
  title: string;
  size: Size;
  topLeft: Position;
  maximized: boolean;
  minimized: boolean;
}

/**
 * Instance of a running application
 */
export interface Application {
  definitionId: string;
  applicationId: string;
  props: ApplicationProps;
  state: "open" | "closing";
  // TODO could be a more specific type?
  args: Record<string, any>;
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
  args?: Record<string, any>;
  props?: Partial<ApplicationProps>;
}

const defaultWindowSize: Size = {
  width: 500,
  height: 300,
};

const defaultWindowPosition: Position = {
  x: 100,
  y: 100,
};

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
        args = {},
        props: userProps = {},
        applicationId = crypto.randomUUID(),
      } = payload;
      const def = applicationsRegistry.definitions[definitionId];

      if (def === undefined) {
        throw new Error(`Unknown application definition ID: ${definitionId}`);
      }

      const currentApplications = Object.values(state.applications);
      const existingInstances = currentApplications.filter(
        (v) => v.definitionId === definitionId
      );

      if (existingInstances.length >= def.instanceLimit) {
        throw new Error(
          `Instance limit reached for application definition ID: ${definitionId}`
        );
      }

      const props = Object.assign<ApplicationProps, Partial<ApplicationProps>>(
        {
          size: { ...def.defaultSize },
          topLeft: { ...def.defaultPosition },
          title: def.name,
          maximized: false,
          minimized: false,
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
        args,
        state: "open",
      };
      state.applications[app.applicationId] = app;
      state.focusQueue.push(app.applicationId);
    },
    startCloseApplication(state, { payload }: PayloadAction<string>) {
      if (payload in state.applications) {
        state.applications[payload].state = "closing";
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
