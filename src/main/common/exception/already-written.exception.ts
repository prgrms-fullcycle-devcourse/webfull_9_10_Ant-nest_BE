import { HttpException, HttpStatus } from "@nestjs/common";

export default class AlreadyWrittenException extends HttpException {
  constructor() {
    super(
      "오늘은 이미 일기를 기록했어요. 내일 또 만나요!",
      HttpStatus.CONFLICT,
    );
  }
}
