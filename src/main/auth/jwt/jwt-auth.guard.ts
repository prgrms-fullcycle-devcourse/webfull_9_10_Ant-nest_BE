import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor() {
    // 1. Passport가 인증 결과를 req.user가 아닌 req.member에 담도록 설정
    super({
      property: "member",
    });
  }

  /**
   * 인증 로직이 끝난 후 실행되는 메서드
   * @param err Passport 내부 에러
   * @param member JwtStrategy의 validate 메서드에서 리턴한 값
   * @param info 토큰 만료 여부 등 상세 정보
   */
  handleRequest(err: any, member: any, info: any) {
    // 2. 에러가 있거나 member 데이터가 없는 경우
    if (err || !member) {
      let message = "인증 정보가 유효하지 않습니다.";

      if (info?.message === "No auth token") {
        message = "인증 토큰이 누락되었습니다.";
      } else if (info?.message === "jwt expired") {
        message = "인증 토큰이 만료되었습니다. 다시 로그인해주세요.";
      }

      throw err || new UnauthorizedException(message);
    }

    return member;
  }
}
