import { HttpException, HttpStatus } from "@nestjs/common";

export class PasswordMismatchException extends HttpException {
  constructor() {
    super("비밀번호 확인이 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
  }
}

export class DuplicateEmailException extends HttpException {
  constructor() {
    super("이미 사용 중인 이메일입니다.", HttpStatus.CONFLICT);
  }
}

export class DuplicateNicknameException extends HttpException {
  constructor() {
    super("이미 사용 중인 닉네임입니다.", HttpStatus.CONFLICT);
  }
}