import { HttpException, HttpStatus } from "@nestjs/common";

export default class DuplicateNicknameException extends HttpException {
  constructor() {
    super("이미 사용 중인 닉네임입니다.", HttpStatus.CONFLICT);
  }
}