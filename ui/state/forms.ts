import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
  Update,
} from "@reduxjs/toolkit";
import {
  makeUserDataMapName,
  type FormNameType,
  type FormRecord,
} from "@shared";
import debounce from "lodash.debounce";
import type { AppThunk, RootState } from "./store";
import { getSyncClient } from "./sync";
import { getActiveUserId } from "./users";

const SLICE_NAME = "forms";

interface InitialState {
  locked: boolean;
}
const initialState: InitialState = { locked: false };

const adapter = createEntityAdapter<FormRecord>();

export const formsSlice = createSlice({
  name: SLICE_NAME,
  initialState: adapter.getInitialState(initialState),
  reducers: {
    setLocked(state, { payload }: PayloadAction<boolean>) {
      state.locked = payload;
    },

    addOneForm: adapter.addOne,
    addManyForms: adapter.addMany,

    removeOneForm: adapter.removeOne,
    removeManyForms: adapter.removeMany,

    setOneForm: adapter.setOne,
    setManyForms: adapter.setMany,

    updateOne: adapter.updateOne,
  },
});

// ========================================
// Selectors
// ========================================
function getSlice(state: RootState) {
  return state[SLICE_NAME];
}

export const {
  selectById: selectFormById,
  selectAll: selectAllForms,
  selectEntities: selectFormEntities,
  selectIds: selectFormIds,
} = adapter.getSelectors(getSlice);

export const selectUserForms = createSelector(
  [getActiveUserId, selectAllForms],
  (userId, forms) => forms.filter((form) => form.userId === userId),
);

export function getUserForm(
  state: RootState,
  formName: FormNameType | undefined,
) {
  const _formName = formName?.toLowerCase();
  const forms = selectUserForms(state);

  return forms.find((form) => form.formName.toLowerCase() === _formName);
}

export function isFormLocked(state: RootState) {
  return getSlice(state).locked;
}

// ========================================
// Actions
// ========================================
export const {
  addManyForms,
  addOneForm,
  removeManyForms,
  removeOneForm,
  setManyForms,
  setOneForm,
  setLocked,
} = formsSlice.actions;

const { updateOne } = formsSlice.actions;

// Hold a debounced sync function **per form id** so simultaneous edits
// to different forms do not block one another.
const syncDebounceMap = new Map<string, ReturnType<typeof debounce>>();

export const updateOneForm =
  (update: Update<FormRecord, string>): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const locked = isFormLocked(state);

    if (locked) {
      console.warn("attempted to update form when locked", update);
      return;
    }

    // 1. Local Redux update (immediate).
    dispatch(updateOne(update));

    // 2. Send to Sync, debounced

    const syncClient = getSyncClient(state);
    if (!syncClient) return;
    console.debug("updateOneForm", "syncClient");

    const form = selectFormById(state, update.id);
    if (!form) return;
    console.debug("updateOneForm", "form", form);

    if (!syncDebounceMap.has(form.id)) {
      console.debug("updateOneForm", "queue");

      syncDebounceMap.set(
        form.id,
        debounce(
          async () => {
            console.debug("updateOneForm", "debounce execute");

            console.debug("updateOneForm", "debounce");
            const map = await syncClient.map(makeUserDataMapName(form.userId));
            const latestForm = selectFormById(getState(), form.id);
            if (!latestForm) return;
            console.debug("updateOneForm", "debounce latest form");

            await map.set(latestForm.id, latestForm);
            console.debug("updateOneForm", "debounce latest done");
          },
          500,
          { leading: false },
        ),
      );
    }

    syncDebounceMap.get(form.id)!();
  };
