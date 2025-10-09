import {
  CALL_CONNECTED_STREAM,
  CALL_INITIATING_STREAM,
  CHANGE_PAGE_STREAM,
  ChangePagePayload,
  DemoLogItem,
  makeContextMapName,
  makeLogMapName,
  makeTurnMapName,
  makeUISyncIdentity,
  makeUserDataMapName,
  type FormRecord,
  type SessionMetaData,
  type TurnRecord,
  type TwilioCallWebhookPayload,
  type UserRecord,
} from "@/shared";
import { isServer } from "@/utils/env";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { SyncClient, type ConnectionState } from "twilio-sync";
import { addOneForm, setLocked, setOneForm } from "./forms";
import { useAppDispatch, useAppSelector, useAppStore } from "./hooks";
import {
  addManySessions,
  addOneSession,
  removeOneSession,
  selectSessionById,
  updateSessionContext,
  type StoreSessionContext,
  type UpdateSessionContext,
} from "./sessions";
import type { AppThunk, RootState } from "./store";
import { addManyTurns, addOneTurn, removeOneTurn, setOneTurn } from "./turns";
import { addManyUsers, getActiveUserId } from "./users";
import { addManyLogs, addOneLog, removeOneLog, setOneLog } from "./logs";

const SLICE_NAME = "sync";

let syncClient: SyncClient | undefined;
const identity = makeUISyncIdentity(
  `${Math.random()}`.slice(2, 2 + 9).padStart(9, "0")
);

type SyncConnectionState = ConnectionState | "started";

interface InitialState {
  initialCallDataLoadStatus: FetchStatus | undefined;
  callInitMap: Record<string, CallInitStatus>; // tracks which calls have been fetched and subscribed to

  initialUserDataLoadStatus: FetchStatus | undefined;
  userFormInitMap: Record<string, UserFormInitStatus>;

  syncConnectionState: SyncConnectionState; // sync client websocket status

  incomingCallSids: string[]; // incoming-call webhook
  incomingCallStreamInitStatus: FetchStatus | undefined;

  connectedCallSids: string[]; // once the call is connected to convo relay
  connectedCallStreamInitStatus: FetchStatus | undefined;

  formStreamInitStatus: FetchStatus | undefined;

  pageChangeRequests: ChangePagePayload[];
}

const initialState: InitialState = {
  initialCallDataLoadStatus: undefined,
  callInitMap: {},

  initialUserDataLoadStatus: undefined,
  userFormInitMap: {},

  syncConnectionState: "unknown",

  incomingCallSids: [],
  incomingCallStreamInitStatus: undefined,

  connectedCallSids: [],
  connectedCallStreamInitStatus: undefined,

  formStreamInitStatus: undefined,

  pageChangeRequests: [],
};

interface CallInitStatus {
  context: FetchStatus;
  turns: FetchStatus;
  logs: FetchStatus;
}

interface UserFormInitStatus {
  form_1: FetchStatus;
  form_2: FetchStatus;
}

type FetchStatus = "started" | "done" | "error";

export const syncSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    // ========================================
    // Call Records
    // ========================================
    setInitialCallDataLoadStatus(
      state,
      { payload }: PayloadAction<FetchStatus>
    ) {
      state.initialCallDataLoadStatus = payload;
    },

    setCallInitStatus(
      state,
      { payload }: PayloadAction<{ callSid: string } & Partial<CallInitStatus>>
    ) {
      if (!state.callInitMap[payload.callSid])
        state.callInitMap[payload.callSid] = {
          context: "started",
          turns: "started",
          logs: "started",
        };

      if (payload.context)
        state.callInitMap[payload.callSid].context = payload.context;
      if (payload.turns)
        state.callInitMap[payload.callSid].turns = payload.turns;

      if (payload.logs) state.callInitMap[payload.callSid].logs = payload.logs;
    },

    // ========================================
    // User & Form Data
    // ========================================
    setInitialUserDataLoadStatus(
      state,
      { payload }: PayloadAction<FetchStatus>
    ) {
      state.initialUserDataLoadStatus = payload;
    },

    setUserFormInitStatus(
      state,
      {
        payload,
      }: PayloadAction<{ userId: string } & Partial<UserFormInitStatus>>
    ) {
      if (!state.userFormInitMap[payload.userId])
        state.userFormInitMap[payload.userId] = {
          form_1: "started",
          form_2: "started",
        };

      if (payload.form_1)
        state.userFormInitMap[payload.userId].form_1 = payload.form_1;
      if (payload.form_2)
        state.userFormInitMap[payload.userId].form_2 = payload.form_2;
    },

    // ========================================
    // Sync Connection
    // ========================================
    setSyncConnectionState(
      state,
      { payload }: PayloadAction<SyncConnectionState>
    ) {
      state.syncConnectionState = payload;
    },

    // ========================================
    // New & Incoming Calls
    // ========================================
    addIncomingCallSid(state, { payload }: PayloadAction<string>) {
      if (state.incomingCallSids.includes(payload)) return;
      state.incomingCallSids.push(payload);
    },
    removeIncomingCallSid(state, { payload }: PayloadAction<string>) {
      state.incomingCallSids = state.incomingCallSids.filter(
        (callSid) => payload !== callSid
      );
    },
    setIncomingCallStreamInitStatus(
      state,
      { payload }: PayloadAction<FetchStatus>
    ) {
      state.incomingCallStreamInitStatus = payload;
    },

    addConnectedCallSid(state, { payload }: PayloadAction<string>) {
      if (state.connectedCallSids.includes(payload)) return;
      state.connectedCallSids.push(payload);
    },
    removeConnectedCallSid(state, { payload }: PayloadAction<string>) {
      state.connectedCallSids = state.connectedCallSids.filter(
        (callSid) => payload !== callSid
      );
    },
    setConnectedCallStreamStatus(
      state,
      { payload }: PayloadAction<FetchStatus>
    ) {
      state.connectedCallStreamInitStatus = payload;
    },

    // ========================================
    // Shared Stream
    // ========================================

    setFormStreamInitStatus(state, { payload }: PayloadAction<FetchStatus>) {
      state.formStreamInitStatus = payload;
    },

    // ========================================
    // Page Change
    // ========================================
    addPageChange(state, { payload }: PayloadAction<ChangePagePayload>) {
      state.pageChangeRequests.push(payload);
    },

    removePageChange(state, { payload }: PayloadAction<string>) {
      state.pageChangeRequests = state.pageChangeRequests.filter(
        (item) => item.id !== payload
      );
    },
  },
});

// ========================================
// Selectors
// ========================================
function getSlice(state: RootState) {
  return state[SLICE_NAME];
}

export function getSyncConnectionState(state: RootState) {
  return getSlice(state).syncConnectionState;
}

function getCallInitMap(state: RootState) {
  return getSlice(state).callInitMap;
}

function getCallInitStatus(
  state: RootState,
  callSid: string
): CallInitStatus | undefined {
  return getCallInitMap(state)[callSid];
}

export function getIsCallLoaded(state: RootState, callSid: string) {
  const statusMap = getCallInitStatus(state, callSid);
  return (
    statusMap?.context === "done" &&
    statusMap?.turns === "done" &&
    statusMap.logs === "done"
  );
}

function getFormInitStatusMap(state: RootState) {
  return getSlice(state).userFormInitMap;
}

function getUserFormInitStatus(
  state: RootState,
  userId: string
): UserFormInitStatus | undefined {
  return getFormInitStatusMap(state)[userId];
}

function getIncomingCallStreamStatus(state: RootState) {
  return getSlice(state).incomingCallStreamInitStatus;
}

function getConnectedCallStreamStatus(state: RootState) {
  return getSlice(state).incomingCallStreamInitStatus;
}

export function getIncomingCallSids(state: RootState) {
  return getSlice(state).incomingCallSids;
}

export function getConnectedCallSids(state: RootState) {
  return getSlice(state).connectedCallSids;
}

function getFormStreamInitStatus(state: RootState) {
  return getSlice(state).formStreamInitStatus;
}

export function getPageChanges(state: RootState) {
  return getSlice(state).pageChangeRequests;
}

// ========================================
// Actions
// ========================================
export const {
  setCallInitStatus,
  setInitialCallDataLoadStatus,

  setInitialUserDataLoadStatus,
  setUserFormInitStatus,

  setSyncConnectionState,

  addIncomingCallSid,
  removeIncomingCallSid,
  setIncomingCallStreamInitStatus,

  addConnectedCallSid,
  removeConnectedCallSid,
  setConnectedCallStreamStatus,

  setFormStreamInitStatus,

  addPageChange,
  removePageChange,
} = syncSlice.actions;

// ========================================
// Sync Client
// ========================================
export function useSyncClient() {
  return useAppSelector(getSyncClient);
}

export function getSyncClient(state: RootState) {
  const connectionState = getSyncConnectionState(state);
  if (connectionState !== "connected") return;
  return syncClient as SyncClient;
}

export const initSyncClient = (): AppThunk => async (dispatch, getState) => {
  if (isServer) return;

  syncClient = new SyncClient(await fetchToken());

  syncClient.on("tokenAboutToExpire", async () => {
    syncClient!.updateToken(await fetchToken());
  });

  syncClient.on("tokenExpired", async () => {
    syncClient!.updateToken(await fetchToken());
  });

  syncClient.on("connectionStateChanged", async (state) => {
    console.log("SyncClient connectionStateChanged", state);
    dispatch(setSyncConnectionState(state));
  });
};

async function fetchToken() {
  const url = `/api/sync-token?identity=${identity}`;

  try {
    const result = await fetch(url).then((res) => res.json());

    return result.token;
  } catch (error) {
    console.error("Error fetching sync token", error);
    throw error;
  }
}

// ========================================
// Data Initialization
// ========================================
/** Fetches the callSid and createdDate for every call. Note: there is no pagination */

export const fetchInitialCallData = (): AppThunk => async (dispatch) => {
  if (isServer) return;

  const fetchSessionMeta = async (page: number) => {
    const res = await fetch(`/api/data/calls?page=${page}`);
    if (!res.ok) throw new Error("Network response was not ok");
    return (await res.json()) as SessionMetaData[];
  };

  try {
    dispatch(setInitialCallDataLoadStatus("started"));
    const sessionsPage1 = await fetchSessionMeta(1); // returns up to 20
    dispatch(addManySessions(sessionsPage1 as StoreSessionContext[]));
    for (const meta of sessionsPage1) // update the date in case session was created without date, which happens when a user goes to a page that references a call because the page needs a placeholder record for subscribers to function properly
      dispatch(
        updateSessionContext({
          callSid: meta.callSid,
          key: "dateCreated",
          value: meta.dateCreated,
        })
      );

    const sessionsPage2 = await fetchSessionMeta(2); // returns every call
    dispatch(addManySessions(sessionsPage2 as StoreSessionContext[]));
    for (const meta of sessionsPage1)
      dispatch(
        updateSessionContext({
          callSid: meta.callSid,
          key: "dateCreated",
          value: meta.dateCreated,
        })
      );

    dispatch(setInitialCallDataLoadStatus("done"));
  } catch (error) {
    dispatch(setInitialCallDataLoadStatus("error"));
  }
};

export const fetchInitialUserData = (): AppThunk => async (dispatch) => {
  if (isServer) return;

  const fetchUserRecords = async (page: number) => {
    const res = await fetch(`/api/data/users?page=${page}`);
    if (!res.ok) throw new Error("Network response was not ok");
    return (await res.json()) as UserRecord[];
  };

  try {
    dispatch(setInitialUserDataLoadStatus("started"));
    const sessionsPage1 = await fetchUserRecords(1); // returns up to 20
    dispatch(addManyUsers(sessionsPage1 as UserRecord[]));

    const sessionsPage2 = await fetchUserRecords(2); // returns every call
    dispatch(addManyUsers(sessionsPage2 as UserRecord[]));

    dispatch(setInitialUserDataLoadStatus("done"));
  } catch (error) {
    dispatch(setInitialUserDataLoadStatus("error"));
  }
};

/**
 * Fetches context and turns for a call and adds listeners to the Sync Maps.
 * This is called on demand. It is executed only when the details are needed,
 * i.e. when a component wants the data.
 *
 * Each call is only requested once.
 */
export function useInitializeCall(callSid?: string) {
  const dispatch = useAppDispatch();
  const syncClient = useSyncClient();
  const store = useAppStore();

  const callStatus = useAppSelector((state) => {
    if (!callSid) return;
    return getCallInitStatus(state, callSid);
  });

  useEffect(() => {
    if (!callSid) return;
    if (!syncClient) return;
    if (callStatus) return;

    dispatch(setCallInitStatus({ callSid })); // sets to default

    const initSyncContext = async () => {
      const uniqueName = makeContextMapName(callSid);
      const map = await syncClient.map(uniqueName);

      const current = selectSessionById(store.getState(), callSid);
      if (!current) {
        const meta = { callSid: callSid, id: callSid } as StoreSessionContext;
        dispatch(addOneSession(meta)); // add placeholder if there isn't a record loaded yet
      }

      map.on("removed", () => dispatch(removeOneSession(callSid)));

      // add sync client listeners
      map.on("itemAdded", ({ item }) =>
        dispatch(
          updateSessionContext({ callSid, key: item.key, value: item.data })
        )
      );
      map.on(
        "itemUpdated",
        ({ item, isLocal }) =>
          !isLocal &&
          dispatch(
            updateSessionContext({ callSid, key: item.key, value: item.data })
          )
      );
      map.on(
        "itemRemoved",
        ({ key }) =>
          dispatch(updateSessionContext({ callSid, key, value: undefined })) // SyncMapItems represent a large JSON object, hence an item being removed is equivalent to it being undefined
      );

      // fetch session context after adding listeners
      const result = await map.getItems();
      for (const item of result.items)
        dispatch(
          updateSessionContext({
            callSid,
            key: item.key,
            value: item.data,
          } as UpdateSessionContext)
        );

      dispatch(setCallInitStatus({ callSid, context: "done" }));
    };

    const initSyncTurns = async () => {
      const uniqueName = makeTurnMapName(callSid);
      const map = await syncClient.map(uniqueName);
      map.on("removed", () => {});

      map.on("itemAdded", (ev) => dispatch(addOneTurn(ev.item.data)));
      map.on("itemRemoved", (ev) => dispatch(removeOneTurn(ev.key)));
      map.on("itemUpdated", (ev) => dispatch(setOneTurn(ev.item.data)));

      // fetch turns after adding listeners
      const result = await map.getItems();
      dispatch(
        addManyTurns(result.items.map((item) => item.data as TurnRecord))
      );

      dispatch(setCallInitStatus({ callSid, turns: "done" }));
    };

    const initSyncLogs = async () => {
      const uniqueName = makeLogMapName(callSid);
      const map = await syncClient.map(uniqueName);
      map.on("removed", () => {});

      map.on("itemAdded", (ev) => dispatch(addOneLog(ev.item.data)));
      map.on("itemRemoved", (ev) => dispatch(removeOneLog(ev.key)));
      map.on("itemUpdated", (ev) => dispatch(setOneLog(ev.item.data)));

      const result = await map.getItems();
      dispatch(
        addManyLogs(result.items.map((item) => item.data as DemoLogItem))
      );

      dispatch(setCallInitStatus({ callSid, logs: "done" }));
    };

    Promise.all([initSyncContext(), initSyncTurns(), initSyncLogs()]);
  }, [callSid, callStatus, syncClient]);
}

/**
 * Fetches the user's forms adds listeners to the Sync Maps.
 * This is called on demand. It is executed only when the details are needed,
 * i.e. when a component wants the data.
 *
 * Each call is only requested once.
 */

export function useInitializeUserForms() {
  const dispatch = useAppDispatch();

  const userId = useAppSelector(getActiveUserId);
  const formStatus = useAppSelector((state) =>
    getUserFormInitStatus(state, userId)
  );
  const syncClient = useSyncClient();

  useEffect(() => {
    if (!syncClient) return;
    if (!userId) return;
    if (formStatus) return;

    dispatch(setUserFormInitStatus({ userId })); // sets to default

    const initForms = async () => {
      const mapUniqueName = makeUserDataMapName(userId);
      const map = await syncClient.map(mapUniqueName);
      map.on("itemAdded", ({ isLocal, item }) => {
        if (isLocal) return;
        if (!("formName" in item.data)) return; // ignore non-forms
        console.log("test");
        dispatch(addOneForm(item.data));
      });

      let timeout: NodeJS.Timeout | undefined;

      // map.on("itemRemoved", ({ key }) => {}); // ignoring because id naming convention is messy
      map.on("itemUpdated", ({ isLocal, item }) => {
        if (isLocal) return;
        if (!("formName" in item.data)) return; // ignore non-forms

        dispatch(setLocked(true));
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          dispatch(setLocked(false));
        }, 1000);

        dispatch(setOneForm(item.data));
      });

      const result = await map.getItems();
      for (const item of result.items) {
        if (!("formName" in item.data)) return; // ignore non-forms
        const form = item.data as FormRecord;

        dispatch(setOneForm(form));

        if (form.formName === "19B-8671-D")
          dispatch(setUserFormInitStatus({ userId, form_1: "done" }));
        else if (form.formName === "19B-8671-TPS")
          dispatch(setUserFormInitStatus({ userId, form_2: "done" }));
        else {
          throw Error("Invalid form name");
        }
      }
    };

    initForms();
  }, [formStatus, syncClient, userId]);
}

// ========================================
// Global Listeners
// ========================================
export function useListenForNewCalls() {
  const dispatch = useAppDispatch();
  const syncClient = useSyncClient();
  const incomingCallStreamStatus = useAppSelector(getConnectedCallStreamStatus);

  useEffect(() => {
    if (!syncClient) return;
    if (incomingCallStreamStatus) return;

    dispatch(setConnectedCallStreamStatus("started"));

    // incoming call webhook
    syncClient.stream(CALL_INITIATING_STREAM).then((stream) => {
      stream.on("messagePublished", (ev) => {
        const payload = ev.message.data as TwilioCallWebhookPayload;
        const session: SessionMetaData = {
          id: payload.CallSid,
          callSid: payload.CallSid,
          dateCreated: new Date().toISOString(),
        };

        dispatch(addOneSession(session as StoreSessionContext));
        dispatch(addIncomingCallSid(session.id));

        setTimeout(() => {
          dispatch(removeIncomingCallSid(session.id));
        }, 5000);
      });
    });

    // conversation relay session fully established
    syncClient.stream(CALL_CONNECTED_STREAM).then((stream) => {
      stream.on("messagePublished", (ev) => {
        const session = {
          dateCreated: new Date().toISOString(),
          ...ev.message.data,
        } as SessionMetaData;

        dispatch(addOneSession(session as StoreSessionContext));
        dispatch(addConnectedCallSid(session.id));

        setTimeout(() => {
          dispatch(removeConnectedCallSid(session.id));
        }, 5000);
      });
    });

    dispatch(setConnectedCallStreamStatus("done"));
  }, [incomingCallStreamStatus, syncClient]);
}

export function useListenForFormStreams() {
  const dispatch = useAppDispatch();
  const syncClient = useSyncClient();
  const formStreamInitStatus = useAppSelector(getFormStreamInitStatus);

  useEffect(() => {
    if (!syncClient) return;
    if (formStreamInitStatus) return;

    dispatch(setFormStreamInitStatus("started"));

    syncClient.stream(CHANGE_PAGE_STREAM).then((stream) => {
      stream.on("messagePublished", (ev) => {
        const data = {
          id: `${Math.random()}`.substring(2, 10),
          ...ev.message.data,
        } as ChangePagePayload;

        dispatch(addPageChange(data));
      });
    });

    dispatch(setFormStreamInitStatus("done"));
  }, [formStreamInitStatus, syncClient]);
}
