import { ApiProperty } from "@nestjs/swagger";

export class TodayQuestionResponseDto {
  @ApiProperty({
    example: "5",
    description: "질문 고유 식별자",
  })
  questionId: string;

  @ApiProperty({
    example: "오늘 당신의 마음을 색깔로 표현한다면 어떤 색인가요?",
    description: "질문 내용",
  })
  content: string;

  constructor(questionId: string, content: string) {
    this.questionId = questionId;
    this.content = content;
  }
}
