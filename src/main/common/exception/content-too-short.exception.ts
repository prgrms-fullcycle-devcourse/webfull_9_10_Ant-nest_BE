import {
  HttpException,
  HttpStatus,
} from "@nestjs/common";

export default class ContentTooShortException extends HttpException {
  constructor() {
    super("조금 더 자세히 들려주세요. (최소 10자 이상)", HttpStatus.BAD_REQUEST);
  }
}