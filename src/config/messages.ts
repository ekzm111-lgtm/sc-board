/**
 * 사용자 피드백 및 알림 한국어 메시지
 */

export const MESSAGES = {
  AUTH: {
    LOGIN_REQUIRED: "로그인이 필요한 서비스입니다.",
    NOT_INVITED: "등록된 학생 명단에 없는 계정입니다. 담임 선생님께 문의해주세요.",
    TEACHER_PENDING: "교사 승인 대기 중입니다. 관리자 승인 후 보드 생성이 가능합니다.",
    DOMAIN_MISMATCH: "학교 구글 계정으로 로그인해주세요.",
  },
  BOARD: {
    LOCKED: "현재 보드가 읽기 전용으로 잠겨 있어 새 글을 작성할 수 없습니다.",
    CREATE_SUCCESS: "새 보드가 성공적으로 생성되었습니다.",
    DELETE_SUCCESS: "보드가 삭제되었습니다.",
  },
  POST: {
    CREATE_SUCCESS: "게시물이 등록되었습니다.",
    APPROVAL_PENDING: "선생님 승인 대기 중입니다. 승인 후 전체 학생에게 공개됩니다.",
    UPDATE_SUCCESS: "게시물이 수정되었습니다.",
    DELETE_SUCCESS: "게시물이 삭제되었습니다.",
    IMAGE_COMPRESSING: "이미지를 최적화 압축하는 중입니다...",
    IMAGE_UPLOAD_FAIL: "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
    REPORT_SUCCESS: "신고가 접수되었습니다. 선생님이 검토 후 조치합니다.",
  },
} as const;
