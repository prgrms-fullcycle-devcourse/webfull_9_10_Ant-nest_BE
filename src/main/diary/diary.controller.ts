import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UseFilters,
  HttpStatus,
  HttpCode,
  Get, Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { DiaryService } from "./diary.service";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import type { AuthenticatedRequest } from "../auth/jwt/jwt.types";
import { WriteDiaryRequestDto } from "./dto/req/write-diary.request.dto";
import { WriteDiaryResponseDto } from "./dto/res/write-diary.response.dto";
import CustomResponse from "../common/response/custom-response";
import { SuccessInterceptor } from "../common/interceptors/success.interceptor";
import { AllExceptionsFilter } from "../common/filters/http-exception.filter";
import { Req } from "@nestjs/common";
import { ApiCustomResponseDecorator } from "../util/decorators/api-custom-response.decorator";
import { GetAllDiariesResponseDto } from "./dto/res/get-all-diaries.resposne.dto";
import { GetDiaryDetailResponseDto } from "./dto/res/get-diary-detail.response.dto";
import { ParseBigIntPipe } from "../common/pipe/parse-bigint.pipe";

@ApiTags("일기")
@ApiBearerAuth("accessToken")
@Controller("/diaries")
@UseInterceptors(SuccessInterceptor)
@UseFilters(AllExceptionsFilter)
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @ApiOperation({
    summary: "오늘 일기 작성 API",
    description: "오늘의 감정, 제목, 답변, 사진을 기록합니다.",
  })
  @ApiCustomResponseDecorator(WriteDiaryResponseDto)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Post()
  async writeDiary(
    @Req() req: AuthenticatedRequest,
    @Body() body: WriteDiaryRequestDto,
  ): Promise<CustomResponse<WriteDiaryResponseDto>> {
    const memberId = BigInt(req.member.id);
    const result = await this.diaryService.writeDiary(memberId, body);

    return new CustomResponse<WriteDiaryResponseDto>(
      result,
      "오늘의 소중한 기록이 저장되었습니다.",
    );
  }

  @ApiOperation({
    summary: "전체 일기 목록 조회 API",
    description:
      "로그인한 사용자가 작성한 모든 일기 목록을 최신순으로 가져옵니다.",
  })
  @ApiCustomResponseDecorator(GetAllDiariesResponseDto)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllDiaries(
    @Req() req: AuthenticatedRequest,
  ): Promise<CustomResponse<GetAllDiariesResponseDto>> {
    const memberId = BigInt(req.member.id);
    const result = await this.diaryService.getAllDiaries(memberId);

    return new CustomResponse<GetAllDiariesResponseDto>(
      result,
      "일기 목록을 성공적으로 불러왔습니다.",
    );
  }

  @ApiOperation({
    summary: "일기 상세 조회 API",
    description:
      "특정 일기의 상세 내용(제목, 본문, 감정, 사진, 질문)을 조회합니다.",
  })
  @ApiCustomResponseDecorator(GetDiaryDetailResponseDto)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get("/:diaryId")
  async getDiaryDetail(
    @Param("diaryId", ParseBigIntPipe) diaryId: bigint,
    @Req() req: AuthenticatedRequest,
  ): Promise<CustomResponse<GetDiaryDetailResponseDto>> {
    const memberId = BigInt(req.member.id);
    const result = await this.diaryService.getDiaryDetail(diaryId, memberId);

    return new CustomResponse<GetDiaryDetailResponseDto>(
      result,
      "일기 정보를 성공적으로 불러왔습니다.",
    );
  }
}
