import React, { ReactNode } from "react";
import { ProviderArgs } from "./type";



const Context = React.createContext({} as ProviderArgs);


export const WidgetContextProvider = ({
  args,
  children,
}: {
  args: ProviderArgs;
  children: ReactNode;
}) => {
  return <Context.Provider value={args}>{children}</Context.Provider>;
};

export const useSharedContext = () => React.useContext(Context);
