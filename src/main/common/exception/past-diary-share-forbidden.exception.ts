import { HttpException, HttpStatus } from "@nestjs/common";

export default class PastDiaryShareForbiddenException extends HttpException {
  constructor() {
    super(
      "오늘 작성한 기록만 광장에 공유할 수 있습니다.",
      HttpStatus.FORBIDDEN,
    );
  }
}
