import { ApiProperty } from "@nestjs/swagger";
import { EmotionType } from "@prisma/client";
import { EmpathyStatResponseDto } from "../../../square/dto/res/empathy-stat.response.dto";

class MonthlyEmotionStatDto {
  @ApiProperty({ enum: EmotionType, example: EmotionType.HAPPY })
  type: EmotionType;

  @ApiProperty({ example: 5 })
  count: number;

  constructor(type: EmotionType, count: number) {
    this.type = type;
    this.count = count;
  }
}

export class MyPageResponseDto {
  @ApiProperty({ example: "choonsik@naver.com" })
  email: string;

  @ApiProperty({ example: "춘식이" })
  nickname: string;

  @ApiProperty({ example: 15 })
  daysSinceJoining: number;

  @ApiProperty({ example: 7 })
  consecutiveDays: number;

  @ApiProperty({ example: 42 })
  totalDiaries: number;

  @ApiProperty({ example: 12 })
  totalSharedDiaries: number;

  @ApiProperty({
    example: 158,
    description: "내가 광장 글을 통해 받은 총 공감 수",
  })
  totalReceivedEmpathyCount: number;

  @ApiProperty({ type: [EmpathyStatResponseDto] })
  receivedEmpathies: EmpathyStatResponseDto[];

  @ApiProperty({ type: [MonthlyEmotionStatDto] })
  monthlyEmotions: MonthlyEmotionStatDto[];

  constructor(
    email: string,
    nickname: string,
    daysSinceJoining: number,
    consecutiveDays: number,
    totalDiaries: number,
    totalSharedDiaries: number,
    totalReceivedEmpathyCount: number,
    receivedEmpathies: EmpathyStatResponseDto[],
    monthlyEmotions: MonthlyEmotionStatDto[],
  ) {
    this.email = email;
    this.nickname = nickname;
    this.daysSinceJoining = daysSinceJoining;
    this.consecutiveDays = consecutiveDays;
    this.totalDiaries = totalDiaries;
    this.totalSharedDiaries = totalSharedDiaries;
    this.totalReceivedEmpathyCount = totalReceivedEmpathyCount;
    this.receivedEmpathies = receivedEmpathies;
    this.monthlyEmotions = monthlyEmotions;
  }
}
