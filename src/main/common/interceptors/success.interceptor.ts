import {
  Injectable,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { map } from "rxjs/operators";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class SuccessInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        // 응답 시점의 시간을 한국 시간으로 포맷팅
        timestamp: dayjs().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        path: request.url,
        message: data.message,
        data: data.data,
        error: data.error,
      })),
    );
  }
}
