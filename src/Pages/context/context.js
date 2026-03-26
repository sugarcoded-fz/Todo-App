import { createContext } from "react";
export const context = createContext({
    Todos: [],
    setTodos: () => { },

    selected: null,
    setSelected: () => { }
})