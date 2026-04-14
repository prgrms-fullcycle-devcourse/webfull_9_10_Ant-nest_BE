import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
        message = Array.isArray(resObj.message)
          ? resObj.message[0]
          : resObj.message || exception.message;

        if (status === 400 && exception.name === "BadRequestException") {
          errorName = "ValidationException";
        } else {
          errorName = exception.constructor.name;
        }
      } else {
        message = res as string;
        errorName = exception.constructor.name;
      }
    }
    // 3. Prisma 관련 에러 처리 (DB 제약 조건 위반 등)
    else if (errorName.includes("Prisma") || exception.code) {
      const fullMessage = exception.message || "";
      const lines = fullMessage.split("\n");
      message =
        lines[lines.length - 1]?.trim() ||
        "데이터베이스 응답 오류가 발생했습니다.";

      switch (exception.code) {
        case "P2002":
          status = HttpStatus.CONFLICT;
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

        case "P2003":
          status = HttpStatus.BAD_REQUEST;
          message = "참조된 데이터(질문 등)가 존재하지 않습니다.";
          errorName = "ForeignKeyViolationException";
          break;

        default:
          status = HttpStatus.BAD_GATEWAY;
          if (message.includes("does not exist")) {
            message =
              "요청하신 리소스(테이블)를 찾을 수 없습니다. DB 설정을 확인해주세요.";
          }
          break;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (errorName === "default" && exception.name) {
      errorName = exception.name;
    }

    const finalMessage =
      typeof message === "string" && message.length > 0
        ? message.trim()
        : "알 수 없는 오류가 발생했습니다.";

    // 4. KST 타임스탬프 생성
    const kstTimestamp = dayjs()
      .tz("Asia/Seoul")
      .format("YYYY-MM-DDTHH:mm:ss.SSSZ");

    // 5. 최종 응답 전송
    response.status(status).json({
      statusCode: status,
      timestamp: kstTimestamp, // KST 적용
      path: request.url,
      message: finalMessage,
      error: errorName,
      data: null,
    });
  }
}
