import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. 기본값 설정
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "서버 내부 오류가 발생했습니다.";
    let errorName =
      exception?.constructor?.name || "InternalServerErrorException";

    // 2. NestJS 표준 HttpException 처리 (400, 401, 403, 404 등)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "object" && res !== null) {
        const resObj = res as any;
        // class-validator 에러 메시지 추출
        message = Array.isArray(resObj.message)
          ? resObj.message[0]
          : resObj.message || exception.message;

        // NestJS 기본 BadRequestException(400)인 경우에만 "ValidationException"으로 명칭 변경
        if (status === 400 && exception.name === "BadRequestException") {
          errorName = "ValidationException";
        } else {
          errorName = exception.constructor.name;
        }
      } else {
        // super("메시지") 처럼 문자열로 응답이 오는 경우
        message = res as string;
        errorName = exception.constructor.name;
      }
    }
    // 3. Prisma 관련 에러 처리 (DB 제약 조건 위반 등)
    else if (errorName.includes("Prisma") || exception.code) {
      const fullMessage = exception.message || "";
      const lines = fullMessage.split("\n");

      // Prisma 에러의 실제 원인이 담긴 마지막 줄 추출
      message =
        lines[lines.length - 1]?.trim() ||
        "데이터베이스 응답 오류가 발생했습니다.";

      // --- [Prisma 상세 코드별 대응] ---
      switch (exception.code) {
        case "P2002": // Unique constraint failed
          status = HttpStatus.CONFLICT; // 409
          const targets = (exception.meta?.target as string[]) || [];

          if (
            targets.includes("member_id") &&
            targets.includes("question_id")
          ) {
            message = "이미 답변한 질문입니다. 새로운 질문에 답해주세요.";
            errorName = "AlreadyAnsweredQuestionException";
          } else if (
            targets.includes("member_id") &&
            targets.includes("diary_date")
          ) {
            message = "오늘은 이미 일기를 작성했습니다.";
            errorName = "AlreadyWrittenException";
          } else {
            message = "중복된 데이터가 존재합니다.";
            errorName = "DuplicateEntryException";
          }
          break;

        case "P2003": // Foreign key constraint failed
          status = HttpStatus.BAD_REQUEST; // 400
          message = "참조된 데이터(질문 등)가 존재하지 않습니다.";
          errorName = "ForeignKeyViolationException";
          break;

        default:
          status = HttpStatus.BAD_GATEWAY; // 502
          if (message.includes("does not exist")) {
            message =
              "요청하신 리소스(테이블)를 찾을 수 없습니다. DB 설정을 확인해주세요.";
          }
          break;
      }
    }
    // 4. 일반적인 JavaScript Error 객체 처리
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // 5. 'export default class' 사용 시 이름이 'default'로 나오는 현상 방지
    if (errorName === "default" && exception.name) {
      errorName = exception.name;
    }

    // 6. 최종 메시지 가공 및 검증
    const finalMessage =
      typeof message === "string" && message.length > 0
        ? message.trim()
        : "알 수 없는 오류가 발생했습니다.";

    // 7. 기획서 규격에 맞춘 최종 응답 전송
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: finalMessage,
      error: errorName,
      data: null,
    });
  }
}
