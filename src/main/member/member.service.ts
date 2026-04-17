import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import dayjs from "dayjs";
import * as bcrypt from "bcrypt";
import { MyPageResponseDto } from "./dto/res/my-page-response.dto";
import MemberNotFoundException from "../common/exception/member-not-found.exception";
import { MySquareHistoryResponseDto } from "./dto/res/my-square-history.response.dto";
import { UpdateNicknameRequestDto } from "./dto/req/update-nickname.request.dto";
import { UpdateNicknameResponseDto } from "./dto/res/update-nickname.response.dto";
import {
  DuplicateNicknameException,
  PasswordMismatchException,
} from "../common/exception/auth.exception";
import { UpdatePasswordRequestDto } from "./dto/req/update-password.request.dto";
import InvalidPasswordException from "../common/exception/invalid-password.exception";
import SamePasswordException from "../common/exception/same-password.exception";
import { EmpathyStatResponseDto } from "../square/dto/res/empathy-stat.response.dto";
import { EmotionType } from "@prisma/client";
import {
  DayEmotionDto,
  MonthlyEmotionResponseDto,
} from "./dto/res/monthly-emotion.response.dto";
import { EmotionInfoResponseDto } from "../diary/dto/res/emotion-info.response.dto";

@Injectable()
export class MemberService {
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

  async getMyPageInfo(memberId: bigint): Promise<MyPageResponseDto> {
    const today = dayjs().tz("Asia/Seoul").startOf("day");

    // 1. 기본 회원 정보 및 일기 목록 조회
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        diaries: { orderBy: { diaryDate: "desc" } },
      },
    });

    if (!member) throw new MemberNotFoundException();

    // 2. 가입 경과일 계산
    const daysSinceJoining =
      today.diff(dayjs(member.createdAt).startOf("day"), "day") + 1;

    // 3. 연속 작성일(Streak) 계산
    let consecutiveDays = 0;
    if (member.diaries.length > 0) {
      let lastDate = dayjs(member.diaries[0].diaryDate)
        .tz("Asia/Seoul")
        .startOf("day");
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

    // 5. 광장에서 내가 받은 공감 집계 (전체 총합 + 종류별 상세)
    // 내가 쓴 글들(SquarePost)에 달린 모든 EmpathyRecord 조회
    const empathyRecords = await this.prisma.empathyRecord.findMany({
      where: {
        squarePost: { diary: { memberId } },
      },
      include: { empathyType: true },
    });

    const totalReceivedEmpathyCount = empathyRecords.length;

    // 상세 통계 가공 (0개 포함 5종 출력)
    const allTypes = await this.prisma.empathyType.findMany({
      orderBy: { id: "asc" },
    });
    const statsMap = new Map<string, { name: string; count: number }>();
    allTypes.forEach((t) =>
      statsMap.set(t.id.toString(), { name: t.name, count: 0 }),
    );

    empathyRecords.forEach((record) => {
      const typeId = record.typeId.toString();
      if (statsMap.has(typeId)) statsMap.get(typeId)!.count++;
    });

    const receivedEmpathies = Array.from(statsMap.entries()).map(
      ([id, val]) => new EmpathyStatResponseDto(id, val.name, val.count),
    );

    // 6. 이달의 내 일기 감정 통계 (이번 달 1일 ~ 오늘)
    const startOfMonth = today.startOf("month").toDate();
    const endOfMonth = today.endOf("month").toDate();

    const monthlyDiaries = await this.prisma.diary.findMany({
      where: {
        memberId,
        diaryDate: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const emotionMap = new Map<EmotionType, number>();
    monthlyDiaries.forEach((d) => {
      emotionMap.set(d.emotion, (emotionMap.get(d.emotion) || 0) + 1);
    });

    const monthlyEmotions = Array.from(emotionMap.entries()).map(
      ([type, count]) => ({ type, count }),
    );

    // 7. 최종 DTO 반환
    return new MyPageResponseDto(
      member.email,
      member.nickname,
      daysSinceJoining,
      consecutiveDays,
      totalDiaries,
      totalSharedDiaries,
      totalReceivedEmpathyCount,
      receivedEmpathies,
      monthlyEmotions,
    );
  }

  // 광장 공유 이력 조회
  async getMySquareHistory(
    memberId: bigint,
  ): Promise<MySquareHistoryResponseDto[]> {
    // 1. 모든 공감 종류(5종) 미리 가져오기 (0개 초기화용)
    const allEmpathyTypes = await this.prisma.empathyType.findMany({
      orderBy: { id: "asc" },
    });

    // 2. 사용자의 일기와 연결된 모든 광장 게시물 조회
    const history = await this.prisma.squarePost.findMany({
      where: {
        diary: { memberId: memberId },
      },
      include: {
        diary: true,
        empathyRecords: {
          include: { empathyType: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. 데이터 가공
    return history.map((post) => {
      // 공감 통계 맵 생성
      const statsMap = new Map<string, { name: string; count: number }>();
      allEmpathyTypes.forEach((type) => {
        statsMap.set(type.id.toString(), { name: type.name, count: 0 });
      });

      // 실제 공감 기록 카운팅
      post.empathyRecords.forEach((record) => {
        const typeId = record.typeId.toString();
        if (statsMap.has(typeId)) {
          statsMap.get(typeId)!.count++;
        }
      });

      // Map을 DTO 배열로 변환
      const empathyStats = Array.from(statsMap.entries()).map(
        ([id, val]) => new EmpathyStatResponseDto(id, val.name, val.count),
      );

      return new MySquareHistoryResponseDto(
        post.id.toString(),
        post.diaryId.toString(),
        post.diary.title,
        post.diary.content,
        post.empathyRecords.length,
        empathyStats,
        dayjs(post.createdAt)
          .tz("Asia/Seoul")
          .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        post.isActive,
      );
    });
  }

  // 닉네임 수정
  async updateNickname(
    memberId: bigint,
    body: UpdateNicknameRequestDto,
  ): Promise<UpdateNicknameResponseDto> {
    // 1. 닉네임 중복 확인
    const existingMember = await this.prisma.member.findFirst({
      where: {
        nickname: body.nickname,
        NOT: {
          id: memberId,
        },
      },
    });

    if (existingMember) {
      throw new DuplicateNicknameException();
    }

    // 2. 닉네임 업데이트
    const updateMember = await this.prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        nickname: body.nickname,
      },
    });

    return new UpdateNicknameResponseDto(updateMember.nickname);
  }

  // 비밀번호 변경
  async updatePassword(
    memberId: bigint,
    body: UpdatePasswordRequestDto,
  ): Promise<void> {
    if (body.currentPassword === body.newPassword) {
      throw new SamePasswordException();
    }

    // 1. 회원 정보 조회
    const member = await this.prisma.member.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member) throw new MemberNotFoundException();

    // 2. 현재 비밀번호 일치 여부 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      body.currentPassword,
      member.password,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidPasswordException();
    }

    // 3. 새 비밀번호와 확인용 비밀번호 일치 여부 확인
    if (body.newPassword !== body.checkPassword) {
      throw new PasswordMismatchException();
    }

    // 4. 새 비밀번호 암호화 및 업데이트
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    await this.prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  // 회원 탈퇴
  async deleteMember(memberId: bigint): Promise<void> {
    // 1. 회원 확인
    const member = await this.prisma.member.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member) {
      throw new MemberNotFoundException();
    }

    // 2. 회원 삭제
    await this.prisma.member.delete({
      where: {
        id: memberId,
      },
    });
  }

  // 월간 감정 현황 조회
  async getMonthlyEmotions(
    memberId: bigint,
    year: number,
    month: number,
  ): Promise<MonthlyEmotionResponseDto> {
    // 1. 해당 월의 시작일과 종료일 계산 (KST 기준)
    const targetDate = dayjs()
      .tz("Asia/Seoul")
      .year(year)
      .month(month - 1);
    const startOfMonth = targetDate.startOf("month").toDate();
    const endOfMonth = targetDate.endOf("month").toDate();
    const daysInMonth = targetDate.daysInMonth();

    // 2. 해당 기간의 일기 목록 조회
    const diaries = await this.prisma.diary.findMany({
      where: {
        memberId: memberId,
        diaryDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        id: true,
        diaryDate: true,
        emotion: true,
      },
    });

    // 3. 1일부터 말일까지 순회하며 데이터 매핑
    const days: DayEmotionDto[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const diaryFound = diaries.find(
        (diary) => dayjs(diary.diaryDate).tz("Asia/Seoul").date() === d,
      );

      if (diaryFound) {
        const emotionInfo = new EmotionInfoResponseDto(
          diaryFound.emotion,
          this.getEmotionName(diaryFound.emotion),
        );
        days.push(new DayEmotionDto(d, diaryFound.id.toString(), emotionInfo));
      } else {
        days.push(new DayEmotionDto(d, null, null));
      }
    }
    return new MonthlyEmotionResponseDto(year, month, days);
  }
}
