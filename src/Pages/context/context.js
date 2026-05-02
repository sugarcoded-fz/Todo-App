import { createContext } from "react";
export const context = createContext({
    todos: [],
    setTodos: () => { },

    selected: null,
    setSelected: () => { }
})