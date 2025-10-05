import { useCallback } from "react";
import localforage from "localforage";
import { DEFAULT_TIER_COLOR_MAP } from "../utils/tierColors.js";
import { flagFromCountryCode, normalizeCountryCode } from "../utils/flags.js";

const STORE_KEYS = {
  prizes: "create::prizes",
  pricing: "create::pricing",
  history: "create::history",
  settings: "create::settings"
};

localforage.config({
  name: "create-kuji",
  storeName: "caris_kuji_store"
});

const DEFAULT_COUNTRY_CODE = "MY";

const DEFAULT_SETTINGS = {
  sessionStatus: "INACTIVE",
  lastReset: null,
  country: "Malaysia",
  countryCode: DEFAULT_COUNTRY_CODE,
  countryEmoji: flagFromCountryCode(DEFAULT_COUNTRY_CODE),
  currency: "MYR",
  locale: "ms-MY",
  tierColors: DEFAULT_TIER_COLOR_MAP,
  nextSessionNumber: 1,
  weightMode: "basic"
};

const mergeSettings = (settings) => {
  const next = {
    ...DEFAULT_SETTINGS,
    ...(settings ?? {})
  };

  next.tierColors = {
    ...DEFAULT_TIER_COLOR_MAP,
    ...(settings?.tierColors ?? {})
  };

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
      localforage.removeItem(STORE_KEYS.history)
    ]);
    await localforage.setItem(STORE_KEYS.settings, {
      ...DEFAULT_SETTINGS,
      lastReset: new Date().toISOString()
    });
  }, []);

  return {
    getPrizes,
    setPrizes,
    getPricing,
    setPricing,
    getSettings,
    setSettings,
    getHistory,
    saveHistory,
    resetAll
  };
}