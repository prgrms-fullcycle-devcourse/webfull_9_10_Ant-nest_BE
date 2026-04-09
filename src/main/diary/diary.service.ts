import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

import { WriteDiaryRequestDto } from "./dto/req/write-diary.request.dto";
import { WriteDiaryResponseDto } from "./dto/res/write-diary.response.dto";
import AlreadyWrittenException from "../common/exception/already-written.exception";
import EmotionRequiredException from "../common/exception/emotion-required.exception";
import ContentTooShortException from "../common/exception/content-too-short.exception";

@Injectable()
export class DiaryService {
  constructor(private readonly prisma: PrismaService) {}

  // 일기 작성
  async writeDiary(
    memberId: bigint,
    body: WriteDiaryRequestDto,
  ): Promise<WriteDiaryResponseDto> {
    if (!body.emotion) throw new EmotionRequiredException();
    if (body.content.length < 10) throw new ContentTooShortException();

    // 2. 날짜 설정
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 3. 중복 작성 여부 확인
    const existingDiary = await this.prisma.diary.findFirst({
      where: {
        memberId: memberId,
        diaryDate: today,
      },
    });

    if (existingDiary) {
      throw new AlreadyWrittenException();
    }

    // 4. 일기 및 사진 저장
    const result = await this.prisma.$transaction(async (tx) => {
      const diary = await tx.diary.create({
        data: {
          memberId: memberId,
          questionId: BigInt(body.questionId),
          title: body.title,
          content: body.content,
          emotion: body.emotion,
          diaryDate: today,
        },
      });

      // 사진이 있다면 저장
      if (body.photoUrls && body.photoUrls.length > 0) {
        await tx.diaryPhoto.createMany({
          data: body.photoUrls.map((url, index) => ({
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
}