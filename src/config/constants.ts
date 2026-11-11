/**
 * School Board 애플리케이션 전역 상수
 */

export const APP_CONFIG = {
  NAME: "School Board",
  DEFAULT_SCHOOL_NAME: "서귀포대신중학교",
  DEFAULT_DOMAIN: "daeshin.ms.kr",
  MAX_IMAGE_WIDTH: 1600,
  IMAGE_MAX_SIZE_MB: 0.3, // 300KB
  MAX_FILE_SIZE_MB: 20, // 20MB
} as const;

export const POST_COLORS = [
  { name: "기본 흰색", value: "#FFFFFF", border: "#E2E8F0" },
  { name: "연노랑", value: "#FEF9C3", border: "#FEF08A" },
  { name: "연파랑", value: "#E0F2FE", border: "#BAE6FD" },
  { name: "연초록", value: "#DCFCE7", border: "#BBF7D0" },
  { name: "연분홍", value: "#FCE7F3", border: "#FBCFE8" },
  { name: "연보라", value: "#F3E8FF", border: "#E9D5FF" },
] as const;

export const BOARD_LAYOUTS = {
  WALL: "wall",
  SHELF: "shelf",
  CANVAS: "canvas",
} as const;
