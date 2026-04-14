import { HttpException, HttpStatus } from "@nestjs/common";

export default class InvalidQuestionOrderException extends HttpException {
  constructor() {
    super("현재 답변해야 할 순서의 질문이 아닙니다.", HttpStatus.BAD_REQUEST);
  }
}
