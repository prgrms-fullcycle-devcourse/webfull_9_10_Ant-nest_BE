import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, member: any, info: any) {
    if (err || !member) {
      throw err || new UnauthorizedException("인증 정보가 유효하지 않습니다.");
    }
    return member;
  }
}
