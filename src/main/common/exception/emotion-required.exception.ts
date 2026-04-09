import { HttpException, HttpStatus } from "@nestjs/common";

export default class EmotionRequiredException extends HttpException {
  constructor() {
    super("오늘의 기분을 선택해주세요.", HttpStatus.BAD_REQUEST);
  }
}