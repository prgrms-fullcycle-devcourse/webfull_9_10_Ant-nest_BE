import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UseFilters,
  HttpStatus,
  HttpCode,
  Get,
  Param,
  Patch,
  Delete,
  UploadedFiles,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

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
import { CheckTodayDiaryResponseDto } from "./dto/res/check-today-diary.response.dto";
import { UpdateDiaryResponseDto } from "./dto/res/update-diary.response.dto";
import { UpdateDiaryRequestDto } from "./dto/req/update-diary.request.dto";
import { S3Service } from "../s3/s3.service";
import { FilesInterceptor } from "@nestjs/platform-express";

@ApiTags("일기")
@ApiBearerAuth("accessToken")
@Controller("/diaries")
@UseInterceptors(SuccessInterceptor)
@UseFilters(AllExceptionsFilter)
export class DiaryController {
  constructor(
    private readonly diaryService: DiaryService,
    private readonly s3Service: S3Service,
  ) {}

  @ApiOperation({
    summary: "오늘 일기 작성 API",
    description: "오늘의 감정, 제목, 답변, 사진을 기록합니다.",
  })
  @ApiCustomResponseDecorator(WriteDiaryResponseDto)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("images", 5))
  @Post()
  async writeDiary(
    @Req() req: AuthenticatedRequest,
    @Body() body: WriteDiaryRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<CustomResponse<WriteDiaryResponseDto>> {
    const memberId = BigInt(req.member.id);

    let photoUrls: string[] = [];
    if (files && files.length > 0) {
      photoUrls = await Promise.all(
        files.map((file) => this.s3Service.uploadDiaryPhoto(file)),
      );
    }

    const result = await this.diaryService.writeDiary(
      memberId,
      body,
      photoUrls,
    );

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
    summary: "오늘 일기 작성 여부 확인 API",
    description:
      "사용자가 오늘 일기를 이미 작성했는지 확인하고, 작성했다면 일기 ID를 반환합니다.",
  })
  @ApiCustomResponseDecorator(CheckTodayDiaryResponseDto)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get("/today")
  async checkTodayDiary(
    @Req() req: AuthenticatedRequest,
  ): Promise<CustomResponse<CheckTodayDiaryResponseDto>> {
    const memberId = BigInt(req.member.id);
    const result = await this.diaryService.checkTodayDiary(memberId);

    const message = result.isWritten
      ? "오늘은 이미 일기를 작성했습니다."
      : "아직 오늘의 일기가 기록되지 않았습니다.";

    return new CustomResponse<CheckTodayDiaryResponseDto>(result, message);
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

  @ApiOperation({
    summary: "일기 수정 API",
    description:
      "내용과 함께 사진을 수정합니다. 새로운 사진을 올리면 기존 사진은 모두 교체됩니다.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiCustomResponseDecorator(UpdateDiaryResponseDto)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("images", 5))
  @Patch("/:diaryId")
  async updateDiary(
    @Param("diaryId", ParseBigIntPipe) diaryId: bigint,
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateDiaryRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<CustomResponse<UpdateDiaryResponseDto>> {
    const memberId = BigInt(req.member.id);

    let newPhotoUrls: string[] = [];
    if (files && files.length > 0) {
      newPhotoUrls = await Promise.all(
        files.map((file) => this.s3Service.uploadDiaryPhoto(file)),
      );
    }

    const result = await this.diaryService.updateDiary(
      diaryId,
      memberId,
      body,
      newPhotoUrls,
      files.length > 0,
    );

    return new CustomResponse(result, "기록이 성공적으로 수정되었습니다.");
  }

  @ApiOperation({
    summary: "일기 삭제 API",
    description:
      "일기를 삭제합니다. 연관된 사진과 광장 게시물도 함께 삭제됩니다.",
  })
  // 삭제 성공 시 200 OK와 함께 메시지 반환
  @UseGuards(JwtAuthGuard)
  @Delete("/:diaryId")
  async deleteDiary(
    @Param("diaryId", ParseBigIntPipe) diaryId: bigint,
    @Req() req: AuthenticatedRequest,
  ): Promise<CustomResponse<void>> {
    const memberId = BigInt(req.member.id);

    await this.diaryService.deleteDiary(diaryId, memberId);

    return new CustomResponse<void>(
      undefined,
      "일기와 공유된 게시물이 모두 삭제되었습니다.",
    );
  }
}
