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

    // 2. NestJS의 HttpException 처리
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      // 메시지 추출 로직 보완
      if (typeof res === "object" && res !== null) {
        const resObj = res as any;
        message = Array.isArray(resObj.message)
          ? resObj.message[0]
          : resObj.message;
        errorName = status === 400 ? "ValidationException" : errorName;
      } else {
        message = res as string;
      }
    }
    // 3. Prisma 관련 에러 처리
    else if (errorName.includes("Prisma")) {
      status = HttpStatus.BAD_GATEWAY;
      const fullMessage = exception.message || "";
      const lines = fullMessage.split("\n");
      message =
        lines[lines.length - 1]?.trim() ||
        "데이터베이스 응답 오류가 발생했습니다.";

      if (message.includes("does not exist")) {
        message =
          "요청하신 리소스(테이블)를 찾을 수 없습니다. DB 설정을 확인해주세요.";
      }
    }
    // 4. 일반적인 Error 객체 처리
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // 5. 최종 메시지 검증 (문자열이 아니거나 비어있으면 기본값 사용)
    const finalMessage =
      typeof message === "string" && message.length > 0
        ? message.trim()
        : "알 수 없는 오류가 발생했습니다.";

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
