import { HttpException, HttpStatus } from "@nestjs/common";

export default class DiaryNotFoundException extends HttpException {
  constructor() {
    super("해당하는 일기 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
  }
}
