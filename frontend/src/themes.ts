

export interface Theme {
  background: string;
  surface: string;
  surface2: string;
  inputBg: string;
  border: string;
  border2: string;
  text: string;
  textMuted: string;
  textDim: string;
  textFaint: string;
  errorBg: string;
  errorBorder: string;
  errorText: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  successBg: string;
  successText: string;
  rejectBg: string;
  rejectText: string;
}

export const themes: Record<string, Theme> = {

  dark: {
    background:    "#0f0f0f",
    surface:       "#1a1a1a",
    surface2:      "#1e1e1e",
    inputBg:       "#111",
    border:        "#2a2a2a",
    border2:       "#333",
    text:          "#ffffff",
    textMuted:     "#aaaaaa",
    textDim:       "#555555",
    textFaint:     "#444444",
    errorBg:       "#2a1515",
    errorBorder:   "#ff4444",
    errorText:     "#ff6666",
    btnPrimaryBg:  "#ffffff",
    btnPrimaryText:"#000000",

    successBg:     "#333",
    successText:   "#4caf50",
    rejectBg:      "#3a1a1a",
    rejectText:    "#ff6666",
  },


  lila: {
  background:     "#f5f0ff",
  surface:        "#e9ddff",
  surface2:       "#ddd0ff",
  inputBg:        "#faf7ff",
  border:         "#cbb8f5",
  border2:        "#b59ae8",
  text:           "#24163a", 
  textMuted:      "#5d4a7a",
  textDim:        "#7d69a3",
  textFaint:      "#a291c2",
  errorBg:        "#fff0f6",
  errorBorder:    "#d946ef",
  errorText:      "#a21caf",
  btnPrimaryBg:   "#7c3aed",
  btnPrimaryText: "#ffffff",
  successBg:      "#b59ae8",
  successText:    "#fff0f6",
  rejectBg:       "#7d69a3",
  rejectText:     "#24163a",
},

  retro: {
    background:    "#0d0208",
    surface:       "#001a0d",
    surface2:      "#002b14",
    inputBg:       "#001a0d",
    border:        "#00ff41",
    border2:       "#00aa2a",
    text:          "#00ff41",
    textMuted:     "#00cc33",
    textDim:       "#007a1f",
    textFaint:     "#005514",
    errorBg:       "#1a0000",
    errorBorder:   "#ff0000",
    errorText:     "#ff4444",
    btnPrimaryBg:  "#00ff41",
    btnPrimaryText:"#000000",
    successBg:     "#007a1f",
    successText:   "#00ff41",
    rejectBg:      "#005514",
    rejectText:    "#00ff41",
  },

  light: {
  background:     "#f7f7fb",
  surface:        "#ffffff",
  surface2:       "#f1eefc",
  inputBg:        "#fbfbfd",

  border:         "#e5e2f0",
  border2:        "#d7d1e6",

  text:           "#1f1b2d",
  textMuted:      "#5f5873",
  textDim:        "#857d9b",
  textFaint:      "#b1aac2",

  errorBg:        "#fff4f5",
  errorBorder:    "#e8799b",
  errorText:      "#be185d",

  btnPrimaryBg:   "#6d5bd0", // morado elegante estilo Notion/Apple
  btnPrimaryText: "#ffffff",
  successBg: "#d7d1e6",
  successText: "#6d5bd0",
  rejectBg:      "#5f5873",
    rejectText:    "#e8799b",
  

},

};



export type ThemeName = keyof typeof themes;