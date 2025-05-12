import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { DemoLogItem } from "@shared";
import type { RootState } from "./store";

const SLICE_NAME = "logs";

const adapter = createEntityAdapter<DemoLogItem>({
  sortComparer: (a, b) => {
    const dateA = new Date(a.dateCreated).getTime();
    const dateB = new Date(b.dateCreated).getTime();
    return dateB - dateA;
  },
});

interface InitialState {}

const initialState: InitialState = {};

export const logsSlice = createSlice({
  name: SLICE_NAME,
  initialState: adapter.getInitialState(initialState),
  reducers: {
    addOneLog: adapter.addOne, // represents one entire call session, which aligns to the entire sync map
    addManyLogs: adapter.addMany,

    removeOneLog: adapter.removeOne,
    setOneLog: adapter.setOne,
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
  selectAll: selectAllLogs,
  selectById: selectLogById,
  selectEntities: selectLogEntities,
  selectIds: selectLogIds,
  selectTotal: selectLogTotals,
} = selectors;

export const selectCallDemoLogs = createSelector(
  [selectAllLogs, (_state: RootState, callSid: string) => callSid],
  (allDemoLogs, callSid: string): DemoLogItem[] => {
    if (!allDemoLogs) return [];

    return allDemoLogs.filter((item) => item.callSid === callSid);
  },
);

// ========================================
// Actions
// ========================================
export const { addOneLog, addManyLogs, removeOneLog, setOneLog } =
  logsSlice.actions;
