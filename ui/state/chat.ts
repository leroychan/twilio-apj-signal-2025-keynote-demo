import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { ChatMessageRecord } from "@shared";
import type { RootState } from "./store";

const SLICE_NAME = "chat";

interface InitialState {
  isChatOpen: boolean;
}
const initialState: InitialState = { isChatOpen: false };

const adapter = createEntityAdapter<ChatMessageRecord>();

export const chatSlice = createSlice({
  name: SLICE_NAME,
  initialState: adapter.getInitialState(initialState),
  reducers: {
    setIsChatOpen(state, { payload }: PayloadAction<boolean>) {
      state.isChatOpen = payload;
    },

    addOneChatMsg: adapter.addOne,
    addManyChatMsgs: adapter.addMany,

    removeOneChatMsg: adapter.removeOne,
    removeManyChatMsgs: adapter.removeMany,

    setOneChatMsg: adapter.setOne,
    setManyChatMsgs: adapter.setMany,
  },
});

// ========================================
// Selectors
// ========================================
function getSlice(state: RootState) {
  return state[SLICE_NAME];
}

export function getIsChatOpen(state: RootState) {
  return getSlice(state).isChatOpen;
}

export const {
  selectById: selectChatMsgById,
  selectAll: selectAllChatMsgs,
  selectEntities: selectChatMsgEntities,
  selectIds: selectChatMsgIds,
} = adapter.getSelectors(getSlice);

// ========================================
// Actions
// ========================================
export const {
  addOneChatMsg,
  addManyChatMsgs,
  removeOneChatMsg,
  removeManyChatMsgs,
  setOneChatMsg,
  setManyChatMsgs,

  setIsChatOpen,
} = chatSlice.actions;
