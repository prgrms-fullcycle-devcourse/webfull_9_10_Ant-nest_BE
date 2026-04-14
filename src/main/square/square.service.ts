import { Injectable } from "@nestjs/common";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";

import { PrismaService } from "../prisma/prisma.service";
import { ShareDiaryRequestDto } from "./dto/req/share-diary.request.dto";
import { ShareDiaryResponseDto } from "./dto/res/share-diary.response.dto";
import DiaryNotFoundException from "../common/exception/diary-not-found.exception";
import ForbiddenException from "../common/exception/forbidden.exception";
import PastDiaryShareForbiddenException from "../common/exception/past-diary-share-forbidden.exception";

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class SquareService {
  constructor(private readonly prisma: PrismaService) {}

  // 달래 광장 공유 토글
  async toggleShare(
    diaryId: bigint,
    memberId: bigint,
    body: ShareDiaryRequestDto,
  ): Promise<ShareDiaryResponseDto> {
    // 1. 일기 존재 및 권한 확인
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
    });

    if (!diary) throw new DiaryNotFoundException();
    if (diary.memberId !== memberId) throw new ForbiddenException();

    // 2. 날짜 확인 (한국 시간 문자열 비교)
    const todayKstStr = dayjs().tz("Asia/Seoul").format("YYYY-MM-DD");
    const diaryDateKstStr = dayjs(diary.diaryDate)
      .tz("Asia/Seoul")
      .format("YYYY-MM-DD");

    // 공유를 시작하려고 할 때만 날짜 제약
    if (body.isActive && todayKstStr !== diaryDateKstStr) {
      throw new PastDiaryShareForbiddenException();
    }

    // 3. 공유 상태 처리
    await this.prisma.$transaction(async (tx) => {
      if (body.isActive) {
        // 공유 시작 시 기존 공감 기록 삭제하여 초기화
        await tx.empathyRecord.deleteMany({
          where: {
            squarePost: { diaryId: diaryId },
          },
        });

        // 광장 게시물 생성 또는 활성화
        await tx.squarePost.upsert({
          where: { diaryId: diaryId },
          update: { isActive: true },
          create: {
            diaryId: diaryId,
            isActive: true,
          },
        });
      } else {
        // 공유 중단: DB에서 삭제하지 않고 비활성화 (마이페이지 기록 확인용)
        await tx.squarePost.update({
          where: { diaryId: diaryId },
          data: { isActive: false },
        });
      }
    });

    return new ShareDiaryResponseDto(diaryId.toString(), body.isActive);
  }
}
