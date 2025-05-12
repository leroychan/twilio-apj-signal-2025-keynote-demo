import { NEXT_PUBLIC_USER_ID } from "@/utils/env.client";
import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { UserRecord } from "@shared";
import type { RootState } from "./store";

const SLICE_NAME = "users";

interface InitialState {
  activeUserId: string;
}
const initialState: InitialState = {
  activeUserId: NEXT_PUBLIC_USER_ID,
};

const adapter = createEntityAdapter<UserRecord>();

export const usersSlice = createSlice({
  name: SLICE_NAME,
  initialState: adapter.getInitialState(initialState),
  reducers: {
    addOneUser: adapter.addOne,
    addManyUsers: adapter.addMany,

    setOneUser: adapter.setOne,
    setManyUsers: adapter.setMany,

    setActiveUserId(state, { payload }: PayloadAction<string>) {
      state.activeUserId = payload;
    },
  },
});

// ========================================
// Selectors
// ========================================
function getSlice(state: RootState) {
  return state[SLICE_NAME];
}

export const {
  selectById: selectUserById,
  selectAll: selectAllUsers,
  selectEntities: selectUserEntities,
  selectIds: selectIds,
} = adapter.getSelectors(getSlice);

export function getActiveUserId(state: RootState) {
  return getSlice(state).activeUserId;
}

export const selectActiveUser = createSelector(
  [getActiveUserId, selectUserEntities],
  (activeUserId, userEntities) => userEntities[activeUserId],
);

// ========================================
// Actions
// ========================================
export const {
  addManyUsers,
  addOneUser,
  setActiveUserId,
  setManyUsers,
  setOneUser,
} = usersSlice.actions;
