import { HttpException, HttpStatus } from "@nestjs/common";

export default class PastDateForbiddenException extends HttpException {
  constructor() {
    super("이미 지난 날짜의 일기는 작성할 수 없습니다.", HttpStatus.FORBIDDEN);
  }
}
