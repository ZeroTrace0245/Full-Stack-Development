import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadBoardFromStorage, saveBoardToStorage } from '../utils/boardStorage';

// Create the Context
const BoardContext = createContext();

// Custom hook so Sachitha's UI can access the data
export const useBoard = () => {
    return useContext(BoardContext);
};

// The Provider that wraps the app
export const BoardProvider = ({ children }) => {
    // Basic state to prevent the Reports page from crashing
    const [tasks, setTasks] = useState(() => {
        return loadBoardFromStorage() || [];
    });

    useEffect(() => {
        saveBoardToStorage(tasks);
    }, [tasks]);

    return (
        <BoardContext.Provider value={{ tasks, setTasks }}>
            {children}
        </BoardContext.Provider>
    );
};