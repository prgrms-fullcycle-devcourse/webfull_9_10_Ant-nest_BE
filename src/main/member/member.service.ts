import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import dayjs from "dayjs";
import { MyPageResponseDto } from "./dto/res/my-page-response.dto";
import MemberNotFoundException from "../common/exception/member-not-found.exception";

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyPageInfo(memberId: bigint): Promise<MyPageResponseDto> {
    const today = dayjs().tz("Asia/Seoul").startOf("day");

    // 1. 기본 회원 정보 조회
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        diaries: {
          orderBy: { diaryDate: "desc" },
        },
      },
    });

    if (!member) {
      throw new MemberNotFoundException();
    }

    // 2. 가입 경과일 계산
    const daysSinceJoining =
      today.diff(dayjs(member.createdAt).startOf("day"), "day") + 1;

    // 3. 연속 작성일 계산
    let consecutiveDays = 0;
    if (member.diaries.length > 0) {
      let lastDate = dayjs(member.diaries[0].diaryDate)
        .tz("Asia/Seoul")
        .startOf("day");

      // 마지막 일기가 오늘 혹은 어제인 경우에만 카운트 시작
      if (today.diff(lastDate, "day") <= 1) {
        consecutiveDays = 1;
        for (let i = 1; i < member.diaries.length; i++) {
          const currentDate = dayjs(member.diaries[i].diaryDate)
            .tz("Asia/Seoul")
            .startOf("day");
          if (lastDate.diff(currentDate, "day") === 1) {
            consecutiveDays++;
            lastDate = currentDate;
          } else {
            break;
          }
        }
      }
    }

    // 4. 총 일기 및 공유 일기 개수
    const totalDiaries = member.diaries.length;
    const totalSharedDiaries = await this.prisma.squarePost.count({
      where: { diary: { memberId } },
    });

    // 5. 광장에서 내가 받은 공감별 개수 집계
    const empathyStats = await this.prisma.empathyRecord.groupBy({
      by: ["typeId"],
      where: {
        squarePost: { diary: { memberId } },
      },
      _count: { _all: true },
    });

    // 공감 종류 이름 매핑
    const empathyTypes = await this.prisma.empathyType.findMany();
    const receivedEmpathies = empathyTypes.map((type) => {
      const stat = empathyStats.find((s) => s.typeId === type.id);
      return {
        typeId: type.id.toString(),
        name: type.name,
        count: stat ? stat._count._all : 0,
      };
    });

    // 6. 이달의 감정 분포 통계
    const startOfMonth = today.startOf("month").toDate();
    const endOfMonth = today.endOf("month").toDate();

    const monthlyDiaries = await this.prisma.diary.findMany({
      where: {
        memberId,
        diaryDate: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { emotion: true },
    });

    const emotionMap = new Map();
    monthlyDiaries.forEach((d) => {
      emotionMap.set(d.emotion, (emotionMap.get(d.emotion) || 0) + 1);
    });

    const monthlyEmotions = Array.from(emotionMap.entries()).map(
      ([type, count]) => ({ type, count }),
    );

    return new MyPageResponseDto(
      member.email,
      member.nickname,
      daysSinceJoining,
      consecutiveDays,
      totalDiaries,
      totalSharedDiaries,
      receivedEmpathies,
      monthlyEmotions,
    );
  }
}
