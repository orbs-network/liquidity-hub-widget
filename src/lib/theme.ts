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


export const lightTheme = {
  colors: {
    primary: "rgb(252, 114, 255)",
    mainBackground: "white",
    textMain: "rgb(34, 34, 34)",
    textSecondary: "rgb(125, 125, 125)",
    border: "white",
    linkMain: "rgb(252, 114, 255)",
    divider: "rgba(34, 34, 34, 0.07)",
    primaryDark: "rgb(251, 88, 255)",
  },
};

export const darkTheme = {
  colors: {
    primary: "rgb(252, 114, 255)",
    mainBackground: "#131313",
    textMain: "#fff",
    textSecondary: "rgb(155, 155, 155)",
    border: "rgba(255, 255, 255, 0.07)",
    linkMain: "rgb(252, 114, 255)",
    divider: "rgba(255, 255, 255, 0.07)",
    primaryDark: "rgb(251, 88, 255)",
  },
};
