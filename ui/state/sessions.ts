import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { SessionContext, SessionMetaData } from "@shared";
import type { AppThunk, RootState } from "./store";

const SLICE_NAME = "sessions";

export interface StoreSessionContext
  extends SessionMetaData,
    Partial<SessionContext> {}

const adapter = createEntityAdapter<StoreSessionContext>({
  sortComparer: (a, b) => {
    const dateA = new Date(a.dateCreated).getTime();
    const dateB = new Date(b.dateCreated).getTime();
    return dateB - dateA;
  },
});

interface InitialState {}

const initialState: InitialState = {};

export const sessionsSlice = createSlice({
  name: SLICE_NAME,
  initialState: adapter.getInitialState(initialState),
  reducers: {
    addOneSession: adapter.addOne, // represents one entire call session, which aligns to the entire sync map
    addManySessions: adapter.addMany,

    removeOneSession: adapter.removeOne,
    setOneSession: adapter.setOne,
  },
});

// ========================================
// Selectors
// ========================================
function getSlice(state: RootState) {
  return state[SLICE_NAME];
}

const selectors = adapter.getSelectors(getSlice);
export const {
  selectAll: selectAllSessions,
  selectById: selectSessionById,
  selectEntities: selectSessionEntities,
  selectIds: selectSessionIds,
  selectTotal: selectSessionTotals,
} = selectors;

export const selectScreenRequestSessions = createSelector(
  [selectAllSessions],
  (sessions) =>
    sessions.filter(
      (session) => session?.screenControl?.permission === "requested",
    ),
);

export const selectRecallItems = createSelector(
  [selectSessionById],
  (session) => session?.recall?.items ?? [],
);

export const selectCallSummary = createSelector(
  [selectSessionById],
  (session) => session?.summary,
);

// ========================================
// Actions
// ========================================
export const {
  addOneSession,
  addManySessions,
  removeOneSession,
  setOneSession,
} = sessionsSlice.actions;

export type UpdateSessionContext<
  K extends keyof StoreSessionContext = keyof StoreSessionContext,
> = {
  callSid: string;
  key: K;
  value: StoreSessionContext[K];
};

export const updateSessionContext =
  ({ callSid, key, value }: UpdateSessionContext): AppThunk =>
  (dispatch, getState) => {
    const currentContext = selectSessionById(getState(), callSid);
    if (!currentContext) throw Error("attempted to update undefined session");

    if (currentContext[key] === value) return; // don't dispatch if values are the same to avoid messy logs

    dispatch(setOneSession({ ...currentContext, [key]: value }));
  };
