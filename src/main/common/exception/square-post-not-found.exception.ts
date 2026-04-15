import { HttpException, HttpStatus } from "@nestjs/common";

export default class SquarePostNotFoundException extends HttpException {
  constructor() {
    super("이미 광장에서 내려간 게시물입니다.", HttpStatus.NOT_FOUND);
  }
}
