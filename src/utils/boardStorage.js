const BOARD_STORAGE_KEY = 'collabboard_board_data'

export const saveBoardToStorage = (board) => {
  try {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board))
  } catch (error) {
    console.error('Failed to save board to localStorage:', error)
  }
}

export const loadBoardFromStorage = () => {
  try {
    const data = localStorage.getItem(BOARD_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load board from localStorage:', error)
    return null
  }
}

export const clearBoardStorage = () => {
  try {
    localStorage.removeItem(BOARD_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear board from localStorage:', error)
  }
}
