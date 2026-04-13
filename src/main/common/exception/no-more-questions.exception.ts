import { HttpException, HttpStatus } from "@nestjs/common";

export default class NoMoreQuestionsException extends HttpException {
  constructor() {
    super(
      "모든 질문에 답변하셨습니다 ! 새로운 질문이 곧 업데이트 될 예정입니다.",
      HttpStatus.NOT_FOUND,
    );
  }
}
