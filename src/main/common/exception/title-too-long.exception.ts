import { HttpException, HttpStatus } from "@nestjs/common";

export default class TitleTooLongException extends HttpException {
  constructor() {
    super("제목은 30자 이내로 작성해주세요.", HttpStatus.BAD_REQUEST);
  }
}
