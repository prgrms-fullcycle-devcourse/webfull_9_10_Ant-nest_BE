import { HttpException, HttpStatus } from "@nestjs/common";

export default class EmailNotFoundException extends HttpException {
  constructor() {
    super("존재하지 않는 이메일입니다.", HttpStatus.NOT_FOUND);
  }
}