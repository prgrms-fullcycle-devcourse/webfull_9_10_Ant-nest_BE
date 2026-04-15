import { HttpException, HttpStatus } from "@nestjs/common";

export default class InvalidEmpathyTypeException extends HttpException {
  constructor() {
    super("올바른 공감 종류를 선택해주세요.", HttpStatus.BAD_REQUEST);
  }
}
