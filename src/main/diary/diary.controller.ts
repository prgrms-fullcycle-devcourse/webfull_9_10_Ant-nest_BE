import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UseFilters,
  HttpStatus, HttpCode,
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
}
