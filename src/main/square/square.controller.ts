import {
  Body,
  Controller, Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { CreateEmpathyResponseDto } from "./dto/res/create-empathy.response.dto";
import { CreateEmpathyRequestDto } from "./dto/req/create-empathy.request.dto";

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

  @ApiOperation({
    summary: "공감 남기기 및 변경 API",
    description:
      "특정 게시물에 공감을 남깁니다. 이미 공감한 경우 종류가 변경됩니다.",
  })
  @ApiCustomResponseDecorator(CreateEmpathyResponseDto)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post("/posts/:postId/empathies")
  async createEmpathy(
    @Param("postId", ParseBigIntPipe) postId: bigint,
    @Req() req: jwtTypes.AuthenticatedRequest,
    @Body() body: CreateEmpathyRequestDto,
  ): Promise<CustomResponse<CreateEmpathyResponseDto>> {
    const memberId = BigInt(req.member.id);
    const result = await this.squareService.createOrUpdateEmpathy(
      postId,
      memberId,
      body,
    );

    return new CustomResponse<CreateEmpathyResponseDto>(
      result,
      "따뜻한 공감이 전달되었습니다.",
    );
  }

  @ApiOperation({
    summary: "공감 취소 API",
    description: "게시물에 남겼던 공감을 취소합니다. (이미 선택한 버튼을 다시 누를 때 사용)",
  })
  @UseGuards(JwtAuthGuard)
  @Delete("/posts/:postId/empathies")
  async deleteEmpathy(
    @Param("postId", ParseBigIntPipe) postId: bigint,
    @Req() req: jwtTypes.AuthenticatedRequest,
  ): Promise<CustomResponse<void>> {

    const memberId = BigInt(req.member.id);

    await this.squareService.deleteEmpathy(postId, memberId);

    return new CustomResponse<void>(
      undefined,
      "공감이 취소되었습니다.",
    );
  }

}
