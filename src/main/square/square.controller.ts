import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
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
import { SquarePostListResponseDto } from "./dto/res/suqare-post-list.response.dto";
import { GetSquarePostsQueryDto } from "./dto/req/get-square-posts-query.dto";

@ApiTags("달래 광장")
@ApiBearerAuth("accessToken")
@Controller("/square")
@UseInterceptors(SuccessInterceptor)
@UseFilters(AllExceptionsFilter)
export class SquareController {
  constructor(private readonly squareService: SquareService) {}

  @ApiOperation({
    summary: "오늘의 광장 피드 조회 API",
    description:
      "오늘 공유된 모든 사용자의 익명 일기를 조회합니다. 인기순(공감 개수 합산)/최신순 정렬을 지원합니다.",
  })
  @ApiCustomResponseDecorator(SquarePostListResponseDto)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get("/posts")
  async getSquarePosts(
    @Req() req: jwtTypes.AuthenticatedRequest,
    @Query() query: GetSquarePostsQueryDto,
  ): Promise<CustomResponse<SquarePostListResponseDto[]>> {
    const memberId = BigInt(req.member.id);
    const result = await this.squareService.getSquarePosts(memberId, query);

    return new CustomResponse<SquarePostListResponseDto[]>(
      result,
      "광장 피드를 성공적으로 불러왔습니다.",
    );
  }

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
