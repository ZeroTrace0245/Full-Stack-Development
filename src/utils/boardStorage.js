/**
 * @fileoverview Utility functions for persisting Kanban board state to the browser's Local Storage.
 * This acts as our temporary database module for Milestone 1 before MongoDB integration.
 */

// Updated to the official project name
const BOARD_STORAGE_KEY = 'novatrack_board_data';

/**
 * Serializes and saves the current board state to Local Storage.
 * 
 * @param {Object|Array} boardState - The current state of the Kanban board (tasks, columns, etc.)
 */
export const saveBoardToStorage = (boardState) => {
  try {
    const serializedData = JSON.stringify(boardState);
    localStorage.setItem(BOARD_STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('[Storage Error]: Failed to save NovaTrack board data to localStorage:', error);
  }
};

/**
 * Retrieves and parses the board state from Local Storage.
 * 
 * @returns {Object|Array|null} The parsed board data, or null if no data exists or an error occurs.
 */
export const loadBoardFromStorage = () => {
  try {
    const storedData = localStorage.getItem(BOARD_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('[Storage Error]: Failed to load NovaTrack board data from localStorage:', error);
    return null;
  }
};

/**
 * Clears the saved board state from Local Storage.
 * Useful for resetting the board or handling user logout.
 */
export const clearBoardStorage = () => {
  try {
    localStorage.removeItem(BOARD_STORAGE_KEY);
  } catch (error) {
    console.error('[Storage Error]: Failed to clear NovaTrack board data from localStorage:', error);
  }
};