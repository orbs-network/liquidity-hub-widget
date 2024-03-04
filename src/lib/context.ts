import { createContext, useContext } from "react";
import { MainContextArgs } from "./type";

const MainContext = createContext({} as MainContextArgs);


export const MainContextProvider = MainContext.Provider;

export const useMainContext = () => {
    return useContext(MainContext);
}