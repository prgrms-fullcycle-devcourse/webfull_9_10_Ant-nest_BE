import {
  Controller,
  Get, HttpCode,
  HttpStatus,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { MemberService } from "./member.service";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import * as jwtTypes from "../auth/jwt/jwt.types";
import CustomResponse from "../common/response/custom-response";
import { SuccessInterceptor } from "../common/interceptors/success.interceptor";
import { AllExceptionsFilter } from "../common/filters/http-exception.filter";
import { MyPageResponseDto } from "./dto/res/my-page-response.dto";
import { ApiCustomResponseDecorator } from "../util/decorators/api-custom-response.decorator";

@ApiTags("마이페이지")
@ApiBearerAuth("accessToken")
@Controller("/members")
@UseInterceptors(SuccessInterceptor)
@UseFilters(AllExceptionsFilter)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @ApiOperation({
    summary: "마이페이지 개인 정보 및 활동 통계 조회 API",
    description:
      "사용자의 프로필 정보와 연속 작성일, 누적 공감 등 전체 통계를 조회합니다.",
  })
  @ApiCustomResponseDecorator(MyPageResponseDto)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/me")
  async getMyPageInfo(
    @Req() req: jwtTypes.AuthenticatedRequest,
  ): Promise<CustomResponse<MyPageResponseDto>> {
    const memberId = BigInt(req.member.id);

    const result = await this.memberService.getMyPageInfo(memberId);

    return new CustomResponse<MyPageResponseDto>(
      result,
      "마이페이지 정보를 성공적으로 불러왔습니다.",
    );
  }
}
