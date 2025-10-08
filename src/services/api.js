// Re-export API functions for easy importing in components
import { kujiAPI } from '../utils/api.js';

export const getUserPrizes = (username) => kujiAPI.getUserPrizes(username);
export const getUserSettings = (username) => kujiAPI.getUserSettings(username);
export const getUserPresets = (username) => kujiAPI.getUserPresets(username);
