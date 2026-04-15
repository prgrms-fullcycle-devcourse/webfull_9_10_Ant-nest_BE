import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
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
import { MySquareHistoryResponseDto } from "./dto/res/my-square-history.response.dto";
import { UpdateNicknameResponseDto } from "./dto/res/update-nickname.response.dto";
import { UpdateNicknameRequestDto } from "./dto/req/update-nickname.request.dto";

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

  @ApiOperation({
    summary: "닉네임 수정 API",
    description:
      "사용자의 닉네임을 변경합니다. 규약 및 중복 체크를 수행합니다.",
  })
  @ApiCustomResponseDecorator(UpdateNicknameResponseDto)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Patch("/me")
  async updateNickname(
    @Req() req: jwtTypes.AuthenticatedRequest,
    @Body() body: UpdateNicknameRequestDto,
  ): Promise<CustomResponse<UpdateNicknameResponseDto>> {
    const memberId = BigInt(req.member.id);
    const result = await this.memberService.updateNickname(memberId, body);

    return new CustomResponse<UpdateNicknameResponseDto>(
      result,
      "회원 정보가 수정되었습니다.",
    );
  }

  @ApiOperation({
    summary: "나의 광장 공유 이력 조회 API",
    description:
      "내가 광장에 공유했던 모든 일기 리스트와 받은 공감 수를 조회합니다.",
  })
  @ApiCustomResponseDecorator(MySquareHistoryResponseDto)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get("/me/square-history")
  async getMySquareHistory(
    @Req() req: jwtTypes.AuthenticatedRequest,
  ): Promise<CustomResponse<MySquareHistoryResponseDto[]>> {
    const memberId = BigInt(req.member.id);
    const result = await this.memberService.getMySquareHistory(memberId);

    return new CustomResponse<MySquareHistoryResponseDto[]>(
      result,
      "광장 공유 이력을 성공적으로 불러왔습니다.",
    );
  }
}
