import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request, Response } from "express";
import CustomResponse from "../response/custom-response";

@Injectable()
export class SuccessInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (data instanceof CustomResponse) {
          return {
            statusCode: response.statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: data.message,
            data: data.data,
            error: data.error,
          };
        }
        return data;
      }),
    );
  }
}
