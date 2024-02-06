import React, { ReactNode } from "react";
import { WidgetArgs } from "lib/type";

interface Context extends WidgetArgs {}

interface Props extends WidgetArgs {
  children: ReactNode;
  widgetArgs: WidgetArgs;
}

const Context = React.createContext({} as Context);

export const WidgetContextProvider = (props: Props) => {
  const { widgetArgs, children } = props;
  return <Context.Provider value={widgetArgs}>{children}</Context.Provider>;
};

export const useWidgetContext = () => React.useContext(Context);
