import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import applications from "../applications";
import { Dimensions, Position } from "@/types";

/**
 * Mutable properties of a running application
 */
export interface ApplicationProps {
  title: string;
  size: Dimensions;
  topLeft: Position;
  maximized: boolean;
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
    applicationIds: [] as string[], // maintained separately for easy + performant iteration
  },
  reducers: {
    openApplication(state, { payload }: PayloadAction<string>) {
      const def = applications.definitions[payload];
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
        },
      };
      state.applications[app.applicationId] = app;
      state.applicationIds.push(app.applicationId);
    },
    closeApplication(state, { payload }: PayloadAction<string>) {
      if (payload in state.applications) {
        delete state.applications[payload];
        const idx = state.applicationIds.indexOf(payload);
        state.applicationIds.splice(idx, 1);
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
      }
    },
  },
});

export const { openApplication, closeApplication, setApplicationProps } =
  activeApplicationsSlice.actions;
export default activeApplicationsSlice.reducer;
