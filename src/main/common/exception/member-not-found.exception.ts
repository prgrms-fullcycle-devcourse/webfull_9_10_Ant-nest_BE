import { HttpException, HttpStatus } from "@nestjs/common";

export default class MemberNotFoundException extends HttpException {
  constructor() {
    super("존재하지 않는 회원입니다.", HttpStatus.NOT_FOUND);
  }
}
