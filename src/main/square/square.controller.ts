import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import CustomResponse from "../common/response/custom-response";
import { ShareDiaryResponseDto } from "./dto/res/share-diary.response.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiCustomResponseDecorator } from "../util/decorators/api-custom-response.decorator";
import { ShareDiaryRequestDto } from "./dto/req/share-diary.request.dto";
import { ParseBigIntPipe } from "../common/pipe/parse-bigint.pipe";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import { SuccessInterceptor } from "../common/interceptors/success.interceptor";
import { AllExceptionsFilter } from "../common/filters/http-exception.filter";
import { SquareService } from "./square.service";
import * as jwtTypes from "../auth/jwt/jwt.types";

@ApiTags("달래 광장")
@ApiBearerAuth("accessToken")
@Controller("/square")
@UseInterceptors(SuccessInterceptor)
@UseFilters(AllExceptionsFilter)
export class SquareController {
  constructor(private readonly squareService: SquareService) {}

  @ApiOperation({
    summary: "광장 게시글 공유 토글 API",
    description: "오늘 작성한 일기를 광장에 공유하거나 공유를 중단합니다.",
  })
  @ApiCustomResponseDecorator(ShareDiaryResponseDto)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Patch("/posts/:diaryId/share")
  async toggleShare(
    @Param("diaryId", ParseBigIntPipe) diaryId: bigint,
    @Req() req: jwtTypes.AuthenticatedRequest,
    @Body() body: ShareDiaryRequestDto,
  ): Promise<CustomResponse<ShareDiaryResponseDto>> {
    const memberId = BigInt(req.member.id);
    const result = await this.squareService.toggleShare(
      diaryId,
      memberId,
      body,
    );

    return new CustomResponse<ShareDiaryResponseDto>(
      result,
      "광장 공유 상태가 변경되었습니다.",
    );
  }
}
