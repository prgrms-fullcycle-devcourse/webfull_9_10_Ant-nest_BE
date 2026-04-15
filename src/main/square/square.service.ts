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
import { EmotionType } from "@prisma/client";
import {
  GetSquarePostsQueryDto,
  SquareSortType,
} from "./dto/req/get-square-posts-query.dto";
import { SquarePostListResponseDto } from "./dto/res/suqare-post-list.response.dto";
import { EmpathyStatResponseDto } from "./dto/res/empathy-stat.response.dto";
import { EmotionInfoResponseDto } from "../diary/dto/res/emotion-info.response.dto";
import { CreateEmpathyRequestDto } from "./dto/req/create-empathy.request.dto";
import { CreateEmpathyResponseDto } from "./dto/res/create-empathy.response.dto";
import SquarePostNotFoundException from "../common/exception/square-post-not-found.exception";
import InvalidEmpathyTypeException from "../common/exception/invalid-empathy-type.exception";
import EmpathyRecordNotFoundException from "../common/exception/empathy-record-not-found.exception";

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class SquareService {
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

  // 달래 광장 공유 토글
  async toggleShare(
    diaryId: bigint,
    memberId: bigint,
    body: ShareDiaryRequestDto,
  ): Promise<ShareDiaryResponseDto> {
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
    });

    if (!diary) throw new DiaryNotFoundException();
    if (diary.memberId !== memberId) throw new ForbiddenException();

    const todayKstStr = dayjs().tz("Asia/Seoul").format("YYYY-MM-DD");
    const diaryDateKstStr = dayjs(diary.diaryDate)
      .tz("Asia/Seoul")
      .format("YYYY-MM-DD");

    if (body.isActive && todayKstStr !== diaryDateKstStr) {
      throw new PastDiaryShareForbiddenException();
    }

    await this.prisma.$transaction(async (tx) => {
      if (body.isActive) {
        await tx.empathyRecord.deleteMany({
          where: { squarePost: { diaryId: diaryId } },
        });

        await tx.squarePost.upsert({
          where: { diaryId: diaryId },
          update: { isActive: true },
          create: { diaryId: diaryId, isActive: true },
        });
      } else {
        await tx.squarePost.update({
          where: { diaryId: diaryId },
          data: { isActive: false },
        });
      }
    });

    return new ShareDiaryResponseDto(diaryId.toString(), body.isActive);
  }

  // 달래광장 피드 조회
  async getSquarePosts(
    memberId: bigint,
    query: GetSquarePostsQueryDto,
  ): Promise<SquarePostListResponseDto[]> {
    const todayStr = dayjs().tz("Asia/Seoul").format("YYYY-MM-DD");
    const todayKstDate = new Date(`${todayStr}T00:00:00Z`);

    const posts = await this.prisma.squarePost.findMany({
      where: {
        isActive: true,
        diary: {
          diaryDate: todayKstDate,
        },
      },
      include: {
        diary: true,
        empathyRecords: {
          include: {
            empathyType: true,
          },
        },
      },
    });

    const result = posts.map((post) => {
      const totalEmpathyCount = post.empathyRecords.length;

      let myReactionId: string | null = null;
      const statsMap = new Map<string, { name: string; count: number }>();

      post.empathyRecords.forEach((record) => {
        const typeId = record.typeId.toString();

        if (!statsMap.has(typeId)) {
          statsMap.set(typeId, { name: record.empathyType.name, count: 0 });
        }
        statsMap.get(typeId)!.count++;

        if (record.memberId === memberId) {
          myReactionId = typeId;
        }
      });

      const empathyStats = Array.from(statsMap.entries()).map(
        ([id, val]) => new EmpathyStatResponseDto(id, val.name, val.count),
      );

      const emotionInfo = new EmotionInfoResponseDto(
        post.diary.emotion,
        this.getEmotionName(post.diary.emotion),
      );

      return new SquarePostListResponseDto(
        post.id.toString(),
        post.diaryId.toString(),
        post.diary.title,
        post.diary.content,
        emotionInfo,
        post.diary.memberId === memberId,
        post.diary.isEdited,
        totalEmpathyCount,
        empathyStats,
        myReactionId,
      );
    });

    if (query.sort === SquareSortType.POPULAR) {
      return result.sort((a, b) => b.totalEmpathyCount - a.totalEmpathyCount);
    }

    return result.sort((a, b) => Number(BigInt(b.postId) - BigInt(a.postId)));
  }

  // 공감 남기기 및 변경
  async createOrUpdateEmpathy(
    postId: bigint,
    memberId: bigint,
    body: CreateEmpathyRequestDto,
  ): Promise<CreateEmpathyResponseDto> {
    // 1. 게시물 존재 및 활성화 여부 확인
    const post = await this.prisma.squarePost.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post || !post.isActive) {
      throw new SquarePostNotFoundException();
    }

    // 2. 유효한 공감 종류 확인
    const typeId = BigInt(body.empathyTypeId);
    const empathyType = await this.prisma.empathyType.findUnique({
      where: { id: typeId },
    });

    if (!empathyType) {
      throw new InvalidEmpathyTypeException();
    }

    // 3. 공감 남기기 또는 변경
    const existingRecord = await this.prisma.empathyRecord.findUnique({
      where: {
        memberId_postId: {
          memberId,
          postId,
        },
      },
    });

    await this.prisma.empathyRecord.upsert({
      where: {
        memberId_postId: { memberId, postId },
      },
      update: {
        typeId: typeId,
      },
      create: {
        memberId: memberId,
        postId: postId,
        typeId: typeId,
      },
    });

    // 4. 변경 후 이 게시물의 전체 공감 개수 조회
    const totalCount = await this.prisma.empathyRecord.count({
      where: {
        postId: postId,
      },
    });

    return new CreateEmpathyResponseDto(
      existingRecord ? "UPDATED" : "CREATED",
      totalCount,
    );
  }

  // 공감 취소
  async deleteEmpathy(postId: bigint, memberId: bigint): Promise<void> {
    // 1. 사용자가 게시물에 남긴 공감이 있는지 확인
    const existingRecord = await this.prisma.empathyRecord.findUnique({
      where: {
        memberId_postId: {
          memberId: memberId,
          postId: postId,
        },
      },
    });

    // 2. 기록이 없으면 404 예외 발생
    if (!existingRecord) {
      throw new EmpathyRecordNotFoundException();
    }

    // 3. 공감 기록 삭제
    await this.prisma.empathyRecord.delete({
      where: {
        memberId_postId: {
          memberId: memberId,
          postId: postId,
        },
      },
    });
  }
}
