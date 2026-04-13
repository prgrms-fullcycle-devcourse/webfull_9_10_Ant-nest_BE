import { Injectable } from '@nestjs/common';
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
  constructor(private readonly prisma: PrismaService) {
  }

  // 오늘의 질문 가져오기 로직
  async getTodayQuestion(memberId: bigint): Promise<TodayQuestionResponseDto> {

    const todayKst = dayjs().tz("Asia/Seoul").format("YYYY-MM-DD");

    // 1. 해당 사용자가 이미 답변한 질문 ID 목록 조회
    const answeredDiaries = await this.prisma.diary.findMany({
      where: {
        memberId: memberId,
      },
      select: {
        questionId: true,
      }
    });

    const answeredIds = answeredDiaries.map((d) => d.questionId);

    // 2. 답변하지 않은 질문들 조회
    const remainingQuestions = await this.prisma.standardQuestion.findMany({
      where: {
        id: {
          notIn: answeredIds
        },
      },
    });

    // 3. 모든 질문들이 소모 됐을 경우 예외 처리
    if(remainingQuestions.length === 0) {
      throw new NoMoreQuestionsException();
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const seedBase = memberId.toString() + todayStr;

    let hash = 0;
    for(let i = 0; i < seedBase.length; i++) {
      hash = (hash << 5) - hash + seedBase.charCodeAt(i);
      hash |= 0;
    }

    const selectedIndex = Math.abs(hash) % remainingQuestions.length;
    const selectedQuestion = remainingQuestions[selectedIndex];

    return new TodayQuestionResponseDto(
      selectedQuestion.id.toString(),
      selectedQuestion.content,
    )

  }

}
