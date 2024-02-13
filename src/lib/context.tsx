import React from "react";
import { ProviderArgs, ProviderArgsWithChildren } from "./type";



const Context = React.createContext({} as ProviderArgs);


export const WidgetContextProvider = (args: ProviderArgsWithChildren) => {
  return <Context.Provider value={args}>{args.children}</Context.Provider>;
};

export const useWidgetContext = () => React.useContext(Context);
