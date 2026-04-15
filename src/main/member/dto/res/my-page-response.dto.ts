import { ApiProperty } from "@nestjs/swagger";
import { EmotionType } from "@prisma/client";

// 1. 공감 통계 상세 (광장에서 받은 반응들)
class EmpathyCountDto {
  @ApiProperty({ example: "2" })
  typeId: string;

  @ApiProperty({ example: "설렘" })
  name: string;

  @ApiProperty({ example: 25 })
  count: number;

  constructor(typeId: string, name: string, count: number) {
    this.typeId = typeId;
    this.name = name;
    this.count = count;
  }
}

// 2. 이달의 감정 통계
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

  @ApiProperty({
    example: 15,
    description: "함께한 날 (가입일로부터 오늘까지)",
  })
  daysSinceJoining: number;

  @ApiProperty({ example: 7, description: "현재 연속 일기 작성일" })
  consecutiveDays: number;

  @ApiProperty({ example: 42, description: "총 작성 일기 개수" })
  totalDiaries: number;

  @ApiProperty({ example: 12, description: "광장에 공유된 일기 개수" })
  totalSharedDiaries: number;

  @ApiProperty({
    type: [EmpathyCountDto],
    description: "광장에서 받은 공감 종류별 개수",
  })
  receivedEmpathies: EmpathyCountDto[];

  @ApiProperty({
    type: [MonthlyEmotionStatDto],
    description: "이달의 감정 통계",
  })
  monthlyEmotions: MonthlyEmotionStatDto[];

  constructor(
    email: string,
    nickname: string,
    daysSinceJoining: number,
    consecutiveDays: number,
    totalDiaries: number,
    totalSharedDiaries: number,
    receivedEmpathies: EmpathyCountDto[],
    monthlyEmotions: MonthlyEmotionStatDto[],
  ) {
    this.email = email;
    this.nickname = nickname;
    this.daysSinceJoining = daysSinceJoining;
    this.consecutiveDays = consecutiveDays;
    this.totalDiaries = totalDiaries;
    this.totalSharedDiaries = totalSharedDiaries;
    this.receivedEmpathies = receivedEmpathies;
    this.monthlyEmotions = monthlyEmotions;
  }
}
