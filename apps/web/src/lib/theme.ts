"use client";

import { createTheme } from "@mui/material/styles";

/**
 * 관리자 콘솔 테마.
 *
 * 웹은 공개 랜딩(`/`) 하나 + 나머지 전부 관리자다. 콘솔도 랜딩과 같은 브랜드로 보여야 하므로
 * 팔레트를 `app/page.module.css`의 :root 값에서 그대로 가져온다: 검정 배경, 블러시 포인트,
 * 흰 글씨. 예전 v1 핑크(#E91E63) + 크림 배경은 지금 브랜드와 무관해서 폐기했다.
 * 관리자 화면은 운영 정보가 우선이므로 시스템 한글 산세리프를 쓴다.
 */

const SANS = ['"Apple SD Gothic Neo"', '"Noto Sans KR"', "system-ui", "sans-serif"].join(",");

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#F2BCC8", // blush200 — 검정 위에서 대비 확보되는 밝은 쪽
      light: "#F7D4DC",
      dark: "#E59BAD",
      contrastText: "#000000",
    },
    secondary: {
      main: "#E59BAD",
      contrastText: "#000000",
    },
    background: {
      default: "#000000",
      paper: "#141110", // 검정 배경 위에서 카드가 뜨도록 한 단계만 밝게
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255,255,255,0.72)",
      disabled: "rgba(255,255,255,0.42)",
    },
    divider: "rgba(255,255,255,0.18)",
  },
  typography: {
    fontFamily: SANS,
    // 표·폼·제목 모두 산세리프로 통일해 운영 화면의 정보 밀도를 안정시킨다.
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        // 다크에서는 그림자가 안 보인다 — 카드 경계는 헤어라인으로 만든다.
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          border: "1px solid rgba(255,255,255,0.12)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});

export default theme;
