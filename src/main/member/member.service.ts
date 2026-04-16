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

  // 광장 공유 이력 조회
  async getMySquareHistory(
    memberId: bigint,
  ): Promise<MySquareHistoryResponseDto[]> {
    // 1. 해당 사용자의 일기와 연결된 모든 광장 게시물 조회
    const history = await this.prisma.squarePost.findMany({
      where: {
        diary: {
          memberId: memberId,
        },
      },
      include: {
        diary: true,
        _count: {
          select: {
            empathyRecords: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // 최신 공유순
      },
    });

    // 2. 응답 DTO
    return history.map((post) => {
      return new MySquareHistoryResponseDto(
        post.id.toString(),
        post.diaryId.toString(),
        post.diary.title,
        post.diary.content,
        post._count.empathyRecords,
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
}
