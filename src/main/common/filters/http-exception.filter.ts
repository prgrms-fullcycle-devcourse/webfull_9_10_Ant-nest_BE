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
    let errorName = exception.constructor.name;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = Array.isArray(res.message) ? res.message[0] : res.message;
      errorName = status === 400 ? "ValidationException" : exception.constructor.name;
    }
    // Prisma 에러인 경우 메시지 가공
    else if (errorName.includes("Prisma")) {
      status = HttpStatus.BAD_GATEWAY;

      // Prisma의 긴 디버깅 메시지에서 실제 원인 문장만 추출
      const fullMessage = exception.message as string;
      const lines = fullMessage.split("\n");
      // 보통 마지막 줄에 실제 원인이 적혀있습니다.
      message = lines[lines.length - 1] || "데이터베이스 오류가 발생했습니다.";

      // 보안을 위해 테이블 미존재 에러 등을 더 깔끔하게 바꿀 수도 있습니다.
      if (message.includes("does not exist")) {
        message = "요청하신 리소스(테이블)를 찾을 수 없습니다. DB 설정을 확인해주세요.";
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message.trim(), // 앞뒤 공백 제거
      error: errorName,
      data: null,
    });
  }
}