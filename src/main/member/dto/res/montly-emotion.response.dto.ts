import { ApiProperty } from "@nestjs/swagger";
import { EmotionInfoResponseDto } from "../../../diary/dto/res/emotion-info.response.dto";

export class DayEmotionDto {
  @ApiProperty({ example: 1, description: "날짜 (일)" })
  day: number;

  @ApiProperty({
    type: EmotionInfoResponseDto,
    nullable: true,
    description: "해당 날짜의 감정 (없으면 null)",
  })
  emotion: EmotionInfoResponseDto | null;

  constructor(day: number, emotion: EmotionInfoResponseDto | null) {
    this.day = day;
    this.emotion = emotion;
  }
}

export class MonthlyEmotionResponseDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 4 })
  month: number;

  @ApiProperty({ type: [DayEmotionDto] })
  days: DayEmotionDto[];

  constructor(year: number, month: number, days: DayEmotionDto[]) {
    this.year = year;
    this.month = month;
    this.days = days;
  }
}
