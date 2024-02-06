import { WidgetUISettings } from "./type";

export const getTheme = (settings?: WidgetUISettings) => {
  const theme = settings?.theme;
  return {
    colors: {
      button: "linear-gradient(180deg,#448aff,#004ce6)",
      buttonDisabled: "linear-gradient(180deg, #252833, #1d212c)",
      primary: "#448aff",
      pageBackground: "#12141B",
      modalBackground: "#12131a",
      textMain: theme?.text?.primary || "#c7cad9",
      buttonText: "white",
      buttonDisabledText: "#c7cad9",
      card: "#232734",
      borderMain: theme?.border?.primary || "rgba(255, 255, 255, 0.07)",
      textSecondary: theme?.text?.secondary || "white",
    },
  };
};
