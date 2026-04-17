import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmotionType } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { WriteDiaryRequestDto } from "./dto/req/write-diary.request.dto";
import { WriteDiaryResponseDto } from "./dto/res/write-diary.response.dto";
import { UpdateDiaryRequestDto } from "./dto/req/update-diary.request.dto";
import { UpdateDiaryResponseDto } from "./dto/res/update-diary.response.dto";
import { GetAllDiariesResponseDto } from "./dto/res/get-all-diaries.resposne.dto";
import { EmotionInfoResponseDto } from "./dto/res/emotion-info.response.dto";
import { DiarySummaryResponseDto } from "./dto/res/diary-summary.response.dto";
import { GetDiaryDetailResponseDto } from "./dto/res/get-diary-detail.response.dto";
import { DiaryPhotoResponseDto } from "./dto/res/diary-photo.response.dto";
import { CheckTodayDiaryResponseDto } from "./dto/res/check-today-diary.response.dto";

import AlreadyWrittenException from "../common/exception/already-written.exception";
import EmotionRequiredException from "../common/exception/emotion-required.exception";
import ContentTooShortException from "../common/exception/content-too-short.exception";
import TitleTooLongException from "../common/exception/title-too-long.exception";
import DiaryNotFoundException from "../common/exception/diary-not-found.exception";
import ForbiddenDiaryException from "../common/exception/forbidden.exception";
import InvalidQuestionOrderException from "../common/exception/invalid-question-order.exception";
import { S3Service } from "../s3/s3.service";

// dayjs 설정
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class DiaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  private getKstTodayDate(): Date {
    const todayStr = dayjs().tz("Asia/Seoul").format("YYYY-MM-DD");
    // "2026-04-15T00:00:00Z" 형태로 만들어 Prisma가 날짜 숫자를 그대로 인식하게 합니다.
    return new Date(`${todayStr}T00:00:00Z`);
  }

  /**
   * 응답용 시간 포맷팅 (KST)
   */
  private formatKst(
    date: Date,
    format: string = "YYYY-MM-DDTHH:mm:ss.SSSZ",
  ): string {
    return dayjs(date).tz("Asia/Seoul").format(format);
  }

  private getEmotionName(type: EmotionType): string {
    const names = {
      [EmotionType.ABSURD]: "황당",
      [EmotionType.ANGRY]: "화남",
      [EmotionType.BLANK]: "무념무상",
      [EmotionType.DEPRESSED]: "우울",
      [EmotionType.DISGUSTED]: "짜증",
      [EmotionType.EXCITED]: "설렘",
      [EmotionType.TIRED]: "지침",
      [EmotionType.HAPPY]: "기쁨",
    };
    return names[type];
  }

  // 1. 일기 작성
  async writeDiary(
    memberId: bigint,
    body: WriteDiaryRequestDto,
    photoUrls: string[],
  ): Promise<WriteDiaryResponseDto> {
    if (body.title.length > 30) throw new TitleTooLongException();
    if (!body.emotion) throw new EmotionRequiredException();
    if (body.content.length < 10) throw new ContentTooShortException();

    // 1. 질문 순서 검증
    const diaryCount = await this.prisma.diary.count({ where: { memberId } });
    const validQuestion = await this.prisma.standardQuestion.findMany({
      orderBy: { id: "asc" },
      skip: diaryCount,
      take: 1,
    });

    if (
      validQuestion.length === 0 ||
      BigInt(body.questionId) !== validQuestion[0].id
    ) {
      throw new InvalidQuestionOrderException();
    }

    // 2. 오늘 날짜 KST 계산
    const todayKst = this.getKstTodayDate();

    // 3. 중복 작성 체크
    const existingDiary = await this.prisma.diary.findFirst({
      where: { memberId, diaryDate: todayKst },
    });
    if (existingDiary) throw new AlreadyWrittenException();

    // 4. DB 저장 (트랜잭션)
    const result = await this.prisma.$transaction(async (tx) => {
      const diary = await tx.diary.create({
        data: {
          memberId,
          questionId: BigInt(body.questionId),
          title: body.title,
          content: body.content,
          emotion: body.emotion,
          diaryDate: todayKst,
        },
      });

      // 컨트롤러에서 넘겨받은 S3 URL들을 DB에 기록
      if (photoUrls.length > 0) {
        await tx.diaryPhoto.createMany({
          data: photoUrls.map((url, index) => ({
            diaryId: diary.id,
            imageUrl: url,
            displayOrder: index,
          })),
        });
      }

      return diary;
    });

    return new WriteDiaryResponseDto(result.id.toString());
  }

  // 2. 전체 일기 목록 조회
  async getAllDiaries(memberId: bigint): Promise<GetAllDiariesResponseDto> {
    const diaries = await this.prisma.diary.findMany({
      where: { memberId },
      include: { standardQuestion: true },
      orderBy: { diaryDate: "desc" },
    });

    const diarySummaries = diaries.map((d) => {
      const emotionInfo = new EmotionInfoResponseDto(
        d.emotion,
        this.getEmotionName(d.emotion),
      );

      return new DiarySummaryResponseDto(
        d.id.toString(),
        d.title,
        dayjs(d.diaryDate).format("YYYY-MM-DD"),
        d.isEdited,
        emotionInfo,
        d.standardQuestion.content,
      );
    });

    return new GetAllDiariesResponseDto(diarySummaries.length, diarySummaries);
  }

  // 3. 일기 상세 조회
  async getDiaryDetail(
    diaryId: bigint,
    memberId: bigint,
  ): Promise<GetDiaryDetailResponseDto> {
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
      include: {
        standardQuestion: true,
        photos: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!diary) throw new DiaryNotFoundException();
    if (diary.memberId !== memberId) throw new ForbiddenDiaryException();

    const emotionInfo = new EmotionInfoResponseDto(
      diary.emotion,
      this.getEmotionName(diary.emotion),
    );

    const photos = diary.photos.map(
      (p) =>
        new DiaryPhotoResponseDto(p.id.toString(), p.imageUrl, p.displayOrder),
    );

    return new GetDiaryDetailResponseDto(
      diary.id.toString(),
      diary.title,
      diary.content,
      dayjs(diary.diaryDate).format("YYYY-MM-DD"),
      diary.isEdited,
      this.formatKst(diary.createdAt),
      diary.isEdited ? this.formatKst(diary.updatedAt) : null,
      emotionInfo,
      diary.standardQuestion.content,
      photos,
    );
  }

  // 4. 오늘 일기 작성 여부 확인
  async checkTodayDiary(memberId: bigint): Promise<CheckTodayDiaryResponseDto> {
    const todayKst = this.getKstTodayDate();

    const diary = await this.prisma.diary.findUnique({
      where: {
        memberId_diaryDate: {
          memberId: memberId,
          diaryDate: todayKst,
        },
      },
      select: { id: true },
    });

    if (diary) return new CheckTodayDiaryResponseDto(true, diary.id.toString());
    return new CheckTodayDiaryResponseDto(false, null);
  }

  // 5. 일기 수정
  async updateDiary(
    diaryId: bigint,
    memberId: bigint,
    body: UpdateDiaryRequestDto,
    newPhotoUrls: string[],
    isImageUpdated: boolean,
  ): Promise<UpdateDiaryResponseDto> {
    // 1. 기존 일기와 사진 정보 조회
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
      include: { photos: true },
    });

    if (!diary) throw new DiaryNotFoundException();
    if (diary.memberId !== memberId) throw new ForbiddenDiaryException();

    // 2. 이미지가 수정되었다면, 기존 S3 파일 삭제 리스트 추출
    const oldPhotoPaths = diary.photos.map((p) => p.imageUrl);

    const updated = await this.prisma.$transaction(async (tx) => {
      // 일기 본문 업데이트
      const diaryUpdate = await tx.diary.update({
        where: { id: diaryId },
        data: {
          title: body.title,
          content: body.content,
          emotion: body.emotion,
          isEdited: true,
        },
      });

      // 3. 사진 교체 로직
      if (isImageUpdated) {
        // DB에서 기존 사진 레코드 삭제
        await tx.diaryPhoto.deleteMany({ where: { diaryId } });

        // DB에 새 사진 레코드 생성
        if (newPhotoUrls.length > 0) {
          await tx.diaryPhoto.createMany({
            data: newPhotoUrls.map((url, index) => ({
              diaryId,
              imageUrl: url,
              displayOrder: index,
            })),
          });
        }
      }
      return diaryUpdate;
    });

    // 4. DB 트랜잭션이 성공한 후, 실제 S3에서 기존 파일 삭제 (좀비 파일 방지)
    if (isImageUpdated && oldPhotoPaths.length > 0) {
      await Promise.all(
        oldPhotoPaths.map((path) => this.s3Service.deleteFile(path)),
      );
    }

    return new UpdateDiaryResponseDto(
      updated.id.toString(),
      this.formatKst(updated.updatedAt),
    );
  }

  // 일기 삭제
  async deleteDiary(diaryId: bigint, memberId: bigint): Promise<void> {
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
      include: { photos: true },
    });

    if (!diary) throw new DiaryNotFoundException();
    if (diary.memberId !== memberId) throw new ForbiddenDiaryException();

    const photoPaths = diary.photos.map((p) => p.imageUrl);

    // 1. DB에서 먼저 삭제
    await this.prisma.diary.delete({ where: { id: diaryId } });

    // 2. 삭제 성공 후 S3 파일들 삭제
    if (photoPaths.length > 0) {
      await Promise.all(
        photoPaths.map((path) => this.s3Service.deleteFile(path)),
      );
    }
  }
}
