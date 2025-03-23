import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import applicationsRegistry from "../applications";
import { Dimensions, Position } from "@/types";
import { removeFromArray } from "@/utils";

/**
 * Mutable properties of a running application
 */
export interface ApplicationProps {
  title: string;
  size: Dimensions;
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
}

/**
 * Partial property updates to apply to given application
 */
export interface ApplicationPropsUpdate {
  applicationId: string;
  props: Partial<ApplicationProps>;
}

export const activeApplicationsSlice = createSlice({
  name: "applications",
  initialState: {
    applications: Object.create(null) as Record<string, Application>,
    focusQueue: [] as (string | null)[],
  },
  reducers: {
    openApplication(state, { payload }: PayloadAction<string>) {
      const def = applicationsRegistry.definitions[payload];
      if (def === undefined) {
        return;
      }

      // TODO probably need some way of specifying arguments to the application - just some object?
      const app: Application = {
        applicationId: crypto.randomUUID(),
        definitionId: payload,
        props: {
          size: {
            width: def.defaultWidth ?? 500,
            height: def.defaultHeight ?? 300,
          },
          topLeft: {
            x: 100,
            y: 100,
          },
          title: def.name,
          maximized: false,
          minimized: false,
        },
      };
      state.applications[app.applicationId] = app;
      state.focusQueue.push(app.applicationId);
    },
    closeApplication(state, { payload }: PayloadAction<string>) {
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
        const baseProps = state.applications[applicationId].props as any;

        // Object.assign but without overwriting existing props with undefined values
        for (const [k, v] of Object.entries(props)) {
          if (v !== undefined) {
            baseProps[k] = v;
          }
        }

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
  closeApplication,
  setApplicationProps,
  focusApplication,
} = activeApplicationsSlice.actions;
export default activeApplicationsSlice.reducer;
