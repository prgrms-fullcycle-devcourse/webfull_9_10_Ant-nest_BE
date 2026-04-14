import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TodayQuestionResponseDto } from "./dto/res/today-question.response.dto";
import NoMoreQuestionsException from "../common/exception/no-more-questions.exception";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  // 오늘의 질문 가져오기 로직
  async getTodayQuestion(memberId: bigint): Promise<TodayQuestionResponseDto> {
    // 1. 사용자가 지금까지 작성한 일기 총 개수 조회
    const diaryCount = await this.prisma.diary.count({
      where: { memberId },
    });

    // 2. 전체 질문을 ID 순으로 정렬했을 때, (diaryCount)만큼 건너뛰고 그 다음 하나를 가져옴
    const nextQuestion = await this.prisma.standardQuestion.findMany({
      orderBy: { id: "asc" },
      skip: diaryCount, // 이미 쓴 개수만큼 건너뜀
      take: 1,
    });

    if (nextQuestion.length === 0) {
      throw new NoMoreQuestionsException();
    }

    return new TodayQuestionResponseDto(
      nextQuestion[0].id.toString(),
      nextQuestion[0].content,
    );
  }
}
