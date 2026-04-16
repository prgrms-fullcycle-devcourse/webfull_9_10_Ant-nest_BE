import { HttpException, HttpStatus } from "@nestjs/common";

export default class SamePasswordException extends HttpException {
  constructor() {
    super(
      "새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.",
      HttpStatus.BAD_REQUEST,
    );
  }
}
