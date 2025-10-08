import { useCallback } from "react";
import localforage from "localforage";
import { DEFAULT_TIER_COLOR_MAP } from "../utils/tierColors.js";
import { flagFromCountryCode, normalizeCountryCode } from "../utils/flags.js";

const STORE_KEYS = {
  prizes: "create::prizes",
  pricing: "create::pricing",
  history: "create::history",
  settings: "create::settings",
  branding: "create::branding",
  dirtyState: "create::dirty_state",
  eventSessions: "create::event_sessions" // Track event sessions with start/end times
};

localforage.config({
  name: "create-kuji",
  storeName: "caris_kuji_store"
});

const DEFAULT_COUNTRY_CODE = "MY";

const DEFAULT_SETTINGS = {
  sessionStatus: "INACTIVE",
  activeEventId: null, // Current active event session ID
  activeEventStartTime: null, // When the current event started
  activeEventName: null, // Name of the active event
  lastReset: null,
  country: "Malaysia",
  countryCode: DEFAULT_COUNTRY_CODE,
  countryEmoji: flagFromCountryCode(DEFAULT_COUNTRY_CODE),
  currency: "MYR",
  locale: "ms-MY",
  tierColors: DEFAULT_TIER_COLOR_MAP,
  nextSessionNumber: 1,
  weightMode: "basic",
  subscriptionPlan: "pro", // Demo users get Pro plan to test all features
  stockPagePublished: true // Stock page is published by default for demo
};

const DEFAULT_BRANDING = {
  companyName: null,
  eventName: null,
  logoUrl: null,
  primaryColor: "#3b82f6",
  secondaryColor: "#8b5cf6",
  accentColor: "#06b6d4",
  fontFamily: "Inter",
  backgroundPattern: null,
  backgroundImage: null,
  footerText: null
};

const mergeSettings = (settings) => {
  const next = {
    ...DEFAULT_SETTINGS,
    ...(settings ?? {})
  };

  // Preserve tier order from settings - only use defaults if no tierColors provided
  // This is critical for drag-and-drop reordering to work
  next.tierColors = settings?.tierColors ?? DEFAULT_TIER_COLOR_MAP;

  next.countryCode = normalizeCountryCode(next.countryCode) || DEFAULT_COUNTRY_CODE;
  next.countryEmoji = next.countryEmoji || flagFromCountryCode(next.countryCode);

  const parsedSession = Number.parseInt(next.nextSessionNumber, 10);
  next.nextSessionNumber = Number.isFinite(parsedSession) && parsedSession > 0 ? parsedSession : 1;

  if (next.weightMode !== "advanced") {
    next.weightMode = "basic";
  }

  return next;
};

export default function useLocalStorageDAO() {
  const getPrizes = useCallback(async () => {
    const data = await localforage.getItem(STORE_KEYS.prizes);
    return Array.isArray(data) ? data : [];
  }, []);

  const setPrizes = useCallback(async (prizes) => {
    await localforage.setItem(STORE_KEYS.prizes, prizes);
  }, []);

  const getPricing = useCallback(async () => {
    const presets = await localforage.getItem(STORE_KEYS.pricing);
    return Array.isArray(presets) ? presets : [];
  }, []);

  const setPricing = useCallback(async (presets) => {
    await localforage.setItem(STORE_KEYS.pricing, presets);
  }, []);

  const getSettings = useCallback(async () => {
    const settings = await localforage.getItem(STORE_KEYS.settings);
    return mergeSettings(settings);
  }, []);

  const setSettings = useCallback(async (settings) => {
    await localforage.setItem(STORE_KEYS.settings, mergeSettings(settings));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('settings-updated', { 
      detail: { settings: mergeSettings(settings) } 
    }));
  }, []);

  const getHistory = useCallback(async () => {
    const history = await localforage.getItem(STORE_KEYS.history);
    return Array.isArray(history) ? history : [];
  }, []);

  const saveHistory = useCallback(async (entries) => {
    await localforage.setItem(STORE_KEYS.history, entries);
  }, []);

  const resetAll = useCallback(async () => {
    await Promise.all([
      localforage.removeItem(STORE_KEYS.prizes),
      localforage.removeItem(STORE_KEYS.pricing),
      localforage.removeItem(STORE_KEYS.history),
      localforage.removeItem(STORE_KEYS.dirtyState)
    ]);
    await localforage.setItem(STORE_KEYS.settings, {
      ...DEFAULT_SETTINGS,
      lastReset: new Date().toISOString()
    });
  }, []);

  // Dirty state management - track unsaved changes
  const getDirtyState = useCallback(async () => {
    const state = await localforage.getItem(STORE_KEYS.dirtyState);
    return state || {};
  }, []);

  const setDirtyFlag = useCallback(async (dataType, isDirty) => {
    const state = await getDirtyState();
    state[dataType] = isDirty;
    await localforage.setItem(STORE_KEYS.dirtyState, state);
    console.log(`🚩 Dirty flag for ${dataType}: ${isDirty}`);
  }, [getDirtyState]);

  const clearDirtyFlag = useCallback(async (dataType) => {
    await setDirtyFlag(dataType, false);
  }, [setDirtyFlag]);

  // Branding methods
  const getBranding = useCallback(async () => {
    const branding = await localforage.getItem(STORE_KEYS.branding);
    return branding ? { ...DEFAULT_BRANDING, ...branding } : DEFAULT_BRANDING;
  }, []);

  const setBranding = useCallback(async (branding) => {
    const merged = { ...DEFAULT_BRANDING, ...branding };
    await localforage.setItem(STORE_KEYS.branding, merged);
  }, []);

  const resetBranding = useCallback(async () => {
    await localforage.setItem(STORE_KEYS.branding, DEFAULT_BRANDING);
  }, []);

  // Event session management
  const getEventSessions = useCallback(async () => {
    const sessions = await localforage.getItem(STORE_KEYS.eventSessions);
    return Array.isArray(sessions) ? sessions : [];
  }, []);

  const saveEventSessions = useCallback(async (sessions) => {
    await localforage.setItem(STORE_KEYS.eventSessions, sessions);
  }, []);

  const createEventSession = useCallback(async (eventName) => {
    const sessions = await getEventSessions();
    const settings = await getSettings();
    
    const newSession = {
      eventId: `event-${Date.now()}`,
      eventName: eventName || `Event ${settings.nextSessionNumber}`,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'ACTIVE',
      totalDraws: 0,
      totalRevenue: 0,
      drawRecords: [] // Array of draw session IDs that belong to this event
    };
    
    await saveEventSessions([...sessions, newSession]);
    return newSession;
  }, [getEventSessions, getSettings]);

  const endEventSession = useCallback(async (eventId) => {
    const sessions = await getEventSessions();
    const updated = sessions.map(session => 
      session.eventId === eventId
        ? { ...session, endTime: new Date().toISOString(), status: 'ENDED' }
        : session
    );
    await saveEventSessions(updated);
  }, [getEventSessions]);

  return {
    getPrizes,
    setPrizes,
    getPricing,
    setPricing,
    getSettings,
    setSettings,
    getHistory,
    saveHistory,
    getBranding,
    setBranding,
    resetBranding,
    resetAll,
    getDirtyState,
    setDirtyFlag,
    clearDirtyFlag,
    getEventSessions,
    saveEventSessions,
    createEventSession,
    endEventSession
  };
}
