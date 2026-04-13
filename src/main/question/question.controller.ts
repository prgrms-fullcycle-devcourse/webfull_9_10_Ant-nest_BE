import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { QuestionService } from "./question.service";
import { ApiOperation } from "@nestjs/swagger";
import { ApiCustomResponseDecorator } from "../util/decorators/api-custom-response.decorator";
import { TodayQuestionResponseDto } from "./dto/res/today-question.response.dto";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";
import * as jwtTypes from "../auth/jwt/jwt.types";
import CustomResponse from "../common/response/custom-response";

@Controller("/questions")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOperation({
    summary: "오늘의 질문 조회 API",
    description:
      "사용자가 답변하지 않은 질문 중 오늘 하루 동안 고정된 질문 하나를 가져옵니다.",
  })
  @ApiCustomResponseDecorator(TodayQuestionResponseDto)
  @UseGuards(JwtAuthGuard)
  @Get("/")
  async getTodayQuestions(
    @Req() req: jwtTypes.AuthenticatedRequest,
  ): Promise<CustomResponse<TodayQuestionResponseDto>> {
    const memberId = BigInt(req.member.id);
    const data = await this.questionService.getTodayQuestion(memberId);

    return new CustomResponse<TodayQuestionResponseDto>(
      data,
      "오늘의 새로운 질문이 도착했습니다.",
    );
  }
}
