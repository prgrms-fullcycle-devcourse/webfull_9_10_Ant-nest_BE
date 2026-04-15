import { HttpException, HttpStatus } from "@nestjs/common";

export default class EmpathyRecordNotFoundException extends HttpException {
  constructor() {
    super("취소할 공감 내역을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
  }
}
