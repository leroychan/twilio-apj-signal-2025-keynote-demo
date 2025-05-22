import { isDev, isServer } from "@/utils/env";
import { configureStore, UnknownAction } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { chatSlice } from "./chat";
import { formsSlice } from "./forms";
import { logsSlice } from "./logs";
import { sessionsSlice } from "./sessions";
import { syncSlice } from "./sync";
import { turnsSlice } from "./turns";
import { usersSlice } from "./users";

export const makeStore = () => {
  return configureStore({
    middleware: (getMiddleware) => {
      const middleware = getMiddleware();
      if (isDev && !isServer) middleware.push(logger);
      return middleware;
    },

    reducer: {
      [chatSlice.name]: chatSlice.reducer,
      [formsSlice.name]: formsSlice.reducer,
      [logsSlice.name]: logsSlice.reducer,
      [sessionsSlice.name]: sessionsSlice.reducer,
      [syncSlice.name]: syncSlice.reducer,
      [turnsSlice.name]: turnsSlice.reducer,
      [usersSlice.name]: usersSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>; // Infer the type of makeStore
export type RootState = ReturnType<AppStore["getState"]>; // Infer the `RootState` and `AppDispatch` types from the store itself
export type AppDispatch = <R>(action: AppAction | AppThunk) => R;

export type AppAction = UnknownAction;
export type AppThunk<RT = void> = (
  dispatch: AppDispatch,
  getState: () => RootState,
) => RT;

export interface AppThunkDependencies {
  dispatch: AppDispatch;
  getState: AppStore["getState"];
}
