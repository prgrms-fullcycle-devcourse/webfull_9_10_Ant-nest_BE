import { HttpException, HttpStatus } from "@nestjs/common";

export default class ForbiddenException extends HttpException {
  constructor() {
    super("해당 기록을 볼 수 있는 권한이 없습니다.", HttpStatus.FORBIDDEN);
  }
}
