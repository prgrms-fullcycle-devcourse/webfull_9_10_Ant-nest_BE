import { ApiProperty } from "@nestjs/swagger";
import { EmotionInfoResponseDto } from "../../../diary/dto/res/emotion-info.response.dto";


export class SquarePostDetailResponseDto {
  @ApiProperty({
    example: "오늘 하루 중 가장 크게 웃었던 순간은 언제인가요?",
    description: "해당 일기의 질문 내용",
  })
  question: string;

  @ApiProperty({ example: "사당역에서 본 노을", description: "일기 제목" })
  title: string;

  @ApiProperty({
    example:
      "지하철역 계단을 올라오는데 노을이 너무 예뻐서 한참을 서 있었네요...",
    description: "일기 본문",
  })
  content: string;

  @ApiProperty({
    type: EmotionInfoResponseDto,
    description: "작성자가 선택한 8종 감정",
  })
  emotion: EmotionInfoResponseDto;

  @ApiProperty({
    example: "2026-04-15T06:30:00.000+09:00",
    description: "작성 시간 (KST)",
  })
  createdAt: string;

  @ApiProperty({ example: 15, description: "받은 총 공감 수" })
  totalEmpathyCount: number;

  constructor(
    question: string,
    title: string,
    content: string,
    emotion: EmotionInfoResponseDto,
    createdAt: string,
    totalEmpathyCount: number,
  ) {
    this.question = question;
    this.title = title;
    this.content = content;
    this.emotion = emotion;
    this.createdAt = createdAt;
    this.totalEmpathyCount = totalEmpathyCount;
  }
}
