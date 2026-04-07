import { HttpException, HttpStatus } from "@nestjs/common";

export default class DuplicateEmailException extends HttpException {
  constructor() {
    super("이미 사용 중인 이메일입니다.", HttpStatus.CONFLICT);
  }
}