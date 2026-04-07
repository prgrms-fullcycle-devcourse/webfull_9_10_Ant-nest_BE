import { HttpException, HttpStatus } from "@nestjs/common";

export default class PasswordMismatchException extends HttpException {
  constructor() {
    super("비밀번호 확인이 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
  }
}