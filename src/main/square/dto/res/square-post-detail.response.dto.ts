import { ApiProperty } from "@nestjs/swagger";

import { EmpathyStatResponseDto } from "./empathy-stat.response.dto";
import { EmotionInfoResponseDto } from "../../../diary/dto/res/emotion-info.response.dto";

export class SquarePostDetailResponseDto {
  @ApiProperty({ example: "오늘 하루 중 가장 크게 웃었던 순간은 언제인가요?" })
  question: string;

  @ApiProperty({ example: "사당역에서 본 노을" })
  title: string;

  @ApiProperty({ example: "지하철역 계단을 올라오는데 노을이 너무 예뻐서..." })
  content: string;

  @ApiProperty({ type: EmotionInfoResponseDto })
  emotion: EmotionInfoResponseDto;

  @ApiProperty({ example: "2026-04-15T06:30:00.000+09:00" })
  createdAt: string;

  @ApiProperty({ example: 15, description: "받은 총 공감 수 (모든 종류 합산)" })
  totalEmpathyCount: number;

  @ApiProperty({
    type: [EmpathyStatResponseDto],
    description: "공감 종류별 상세 통계",
  })
  empathyStats: EmpathyStatResponseDto[];

  constructor(
    question: string,
    title: string,
    content: string,
    emotion: EmotionInfoResponseDto,
    createdAt: string,
    totalEmpathyCount: number,
    empathyStats: EmpathyStatResponseDto[],
  ) {
    this.question = question;
    this.title = title;
    this.content = content;
    this.emotion = emotion;
    this.createdAt = createdAt;
    this.totalEmpathyCount = totalEmpathyCount;
    this.empathyStats = empathyStats;
  }
}
