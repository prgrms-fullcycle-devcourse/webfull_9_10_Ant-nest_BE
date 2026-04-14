import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

import { WriteDiaryRequestDto } from "./dto/req/write-diary.request.dto";
import { WriteDiaryResponseDto } from "./dto/res/write-diary.response.dto";
import AlreadyWrittenException from "../common/exception/already-written.exception";
import EmotionRequiredException from "../common/exception/emotion-required.exception";
import ContentTooShortException from "../common/exception/content-too-short.exception";
import { EmotionType } from "@prisma/client";
import { GetAllDiariesResponseDto } from "./dto/res/get-all-diaries.resposne.dto";
import { EmotionInfoResponseDto } from "./dto/res/emotion-info.response.dto";
import { DiarySummaryResponseDto } from "./dto/res/diary-summary.response.dto";
import { GetDiaryDetailResponseDto } from "./dto/res/get-diary-detail.response.dto";
import DiaryNotFoundException from "../common/exception/diary-not-found.exception";
import { DiaryPhotoResponseDto } from "./dto/res/diary-photo.response.dto";
import { CheckTodayDiaryResponseDto } from "./dto/res/check-today-diary.response.dto";
import dayjs from "dayjs";
import { UpdateDiaryResponseDto } from "./dto/res/update-diary.response.dto";
import TitleTooLongException from "../common/exception/title-too-long.exception";
import { UpdateDiaryRequestDto } from "./dto/req/update-diary.request.dto";
import InvalidQuestionOrderException from "../common/exception/invalid-question-order.exception";

class ForbiddenDiaryException implements Error {
  message: string;
  name: string;
}

@Injectable()
export class DiaryService {
  constructor(private readonly prisma: PrismaService) {}

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

  // 일기 작성
  async writeDiary(
    memberId: bigint,
    body: WriteDiaryRequestDto,
  ): Promise<WriteDiaryResponseDto> {
    if (body.title.length > 30) throw new TitleTooLongException();
    if (!body.emotion) throw new EmotionRequiredException();
    if (body.content.length < 10) throw new ContentTooShortException();

    // 1. 사용자가 현재 답변해야 할 질문 ID가 무엇인지 서버에서 직접 계산
    const diaryCount = await this.prisma.diary.count({
      where: { memberId },
    });

    const validQuestion = await this.prisma.standardQuestion.findMany({
      orderBy: { id: "asc" },
      skip: diaryCount,
      take: 1,
    });

    // 2. 요청받은 questionId와 서버가 계산한 ID가 일치하는지 검증
    if (
      validQuestion.length === 0 ||
      BigInt(body.questionId) !== validQuestion[0].id
    ) {
      throw new InvalidQuestionOrderException();
    }

    const todayKst = dayjs().tz("Asia/Seoul").startOf("day").toDate();

    // 3. 중복 작성 여부 확인 (오늘 이미 썼는지)
    const existingDiary = await this.prisma.diary.findFirst({
      where: { memberId, diaryDate: todayKst },
    });

    if (existingDiary) {
      throw new AlreadyWrittenException();
    }

    // 4. 저장 로직 실행
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
      // 사진 저장 로직
      return diary;
    });

    return new WriteDiaryResponseDto(result.id.toString());
  }

  // 전체 일기 목록 조회
  async getAllDiaries(memberId: bigint): Promise<GetAllDiariesResponseDto> {
    const diaries = await this.prisma.diary.findMany({
      where: { memberId },
      include: {
        standardQuestion: true,
      },
      orderBy: {
        diaryDate: "desc",
      },
    });

    const diarySummaries = diaries.map((d) => {
      const emotionInfo = new EmotionInfoResponseDto(
        d.emotion,
        this.getEmotionName(d.emotion),
      );

      return new DiarySummaryResponseDto(
        d.id.toString(),
        d.title,
        d.diaryDate.toISOString().split("T")[0],
        d.isEdited,
        emotionInfo,
        d.standardQuestion.content,
      );
    });

    return new GetAllDiariesResponseDto(diarySummaries.length, diarySummaries);
  }

  // 일기 상세 조회
  async getDiaryDetail(
    diaryId: bigint,
    memberId: bigint,
  ): Promise<GetDiaryDetailResponseDto> {
    // 1. 일기 조회 (질문과 사진 정보를 포함)
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
      include: {
        standardQuestion: true,
        photos: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    // 2. 존재 여부 확인 (404)
    if (!diary) {
      throw new DiaryNotFoundException();
    }

    // 3. 권한 확인 (본인의 일기인지 체크) (403)
    if (diary.memberId !== memberId) {
      throw new ForbiddenDiaryException();
    }

    // 4. 감정 정보 생성
    const emotionInfo = new EmotionInfoResponseDto(
      diary.emotion,
      this.getEmotionName(diary.emotion),
    );

    // 5. 사진 정보 매핑
    const photos = diary.photos.map(
      (p) =>
        new DiaryPhotoResponseDto(p.id.toString(), p.imageUrl, p.displayOrder),
    );

    // 6. 최종 DTO 반환
    return new GetDiaryDetailResponseDto(
      diary.id.toString(),
      diary.title,
      diary.content,
      diary.diaryDate.toISOString().split("T")[0],
      diary.isEdited,
      diary.createdAt.toISOString(),
      diary.isEdited ? diary.updatedAt.toISOString() : null, // 수정되지 않았으면 null
      emotionInfo,
      diary.standardQuestion.content,
      photos,
    );
  }

  // 오늘 일기 작성 여부 확인
  async checkTodayDiary(memberId: bigint): Promise<CheckTodayDiaryResponseDto> {
    // 1. 한국 시간 기준 오늘 날짜 (00:00:00) 계산
    const todayKst = dayjs().tz("Asia/Seoul").startOf("day").toDate();

    // 2. DB에서 해당 사용자의 오늘 날짜 일기가 있는지 조회
    const diary = await this.prisma.diary.findUnique({
      where: {
        memberId_diaryDate: {
          memberId: memberId,
          diaryDate: todayKst,
        },
      },
      select: {
        id: true,
      },
    });

    // 3. 결과에 따른 DTO 반환
    if (diary) {
      return new CheckTodayDiaryResponseDto(true, diary.id.toString());
    }

    return new CheckTodayDiaryResponseDto(false, null);
  }

  // 일기 수정
  async updateDiary(
    diaryId: bigint,
    memberId: bigint,
    body: UpdateDiaryRequestDto,
  ): Promise<UpdateDiaryResponseDto> {
    // 1. 일기 존재 및 권한 확인
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
    });

    if (!diary) {
      throw new DiaryNotFoundException();
    }
    if (diary.memberId !== memberId) {
      throw new ForbiddenDiaryException();
    }

    // 2. 비즈니스 로직 검증 (제목/본문 길이)
    if (body.title.length > 30) throw new TitleTooLongException();
    if (body.content.length < 10) throw new ContentTooShortException();

    // 3. 트랜잭션: 일기 정보 수정 및 사진 교체
    const updated = await this.prisma.$transaction(async (tx) => {
      // 일기 기본 정보 수정 (isEdited를 true로 강제 설정)
      const diaryUpdate = await tx.diary.update({
        where: { id: diaryId },
        data: {
          title: body.title,
          content: body.content,
          emotion: body.emotion,
          isEdited: true,
        },
      });

      // 기존 사진 삭제 후 새로운 사진 등록 (사진 수정 로직의 가장 깔끔한 방식)
      if (body.photoUrls) {
        await tx.diaryPhoto.deleteMany({
          where: { diaryId: diaryId },
        });

        if (body.photoUrls.length > 0) {
          await tx.diaryPhoto.createMany({
            data: body.photoUrls.map((url, index) => ({
              diaryId: diaryId,
              imageUrl: url,
              displayOrder: index,
            })),
          });
        }
      }

      return diaryUpdate;
    });

    return new UpdateDiaryResponseDto(
      updated.id.toString(),
      updated.updatedAt.toISOString(),
    );
  }

  // 일기 삭제
  async deleteDiary(diaryId: bigint, memberId: bigint): Promise<void> {
    // 1. 일기 존재 여부 확인
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
    });

    // 404 에러 처리
    if (!diary) {
      throw new DiaryNotFoundException();
    }

    // 2. 권한 확인 (본인의 일기인지 체크)
    // 403 에러 처리
    if (diary.memberId !== memberId) {
      throw new ForbiddenDiaryException();
    }

    // 3. 일기 삭제
    // (연결된 DiaryPhoto, SquarePost, EmpathyRecord는 CASCADE에 의해 자동 삭제됨)
    await this.prisma.diary.delete({
      where: { id: diaryId },
    });
  }
}
