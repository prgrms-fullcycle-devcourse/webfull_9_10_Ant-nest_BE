import { HttpException, HttpStatus } from "@nestjs/common";

export default class InvalidPasswordException extends HttpException {
  constructor() {
    super("비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED);
  }
}
