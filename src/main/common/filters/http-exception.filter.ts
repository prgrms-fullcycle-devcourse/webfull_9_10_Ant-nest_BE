import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  Request,
  Response,
} from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "서버 내부 오류가 발생했습니다.";
    let errorName = exception?.constructor?.name || "InternalServerErrorException";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = Array.isArray(res.message) ? res.message[0] : res.message;
      errorName = status === 400 ? "ValidationException" : errorName;
    }

    else if (errorName.includes("Prisma")) {
      status = HttpStatus.BAD_GATEWAY;
      const fullMessage = exception.message || "";
      const lines = fullMessage.split("\n");
      // Prisma 에러 메시지의 마지막 줄 추출, 없으면 기본 메시지
      message = lines[lines.length - 1]?.trim() || "데이터베이스 응답 오류가 발생했습니다.";

      if (message.includes("does not exist")) {
        message = "요청하신 리소스(테이블)를 찾을 수 없습니다. DB 설정을 확인해주세요.";
      }
    }

    else if (exception instanceof Error) {
      message = exception.message;
    }

    const finalMessage = (typeof message === 'string' ? message : String(message)).trim();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: finalMessage || "알 수 없는 에러가 발생했습니다.",
      error: errorName,
      data: null,
    });
  }
}