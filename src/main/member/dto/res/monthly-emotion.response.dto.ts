import { ApiProperty } from "@nestjs/swagger";
import { EmotionInfoResponseDto } from "../../../diary/dto/res/emotion-info.response.dto";

export class DayEmotionDto {
  @ApiProperty({ example: 1 })
  day: number;

  @ApiProperty({
    example: "105",
    nullable: true,
    description: "일기 고유 ID (없으면 null)",
  })
  diaryId: string | null;

  @ApiProperty({ type: EmotionInfoResponseDto, nullable: true })
  emotion: EmotionInfoResponseDto | null;

  constructor(
    day: number,
    diaryId: string | null,
    emotion: EmotionInfoResponseDto | null,
  ) {
    this.day = day;
    this.diaryId = diaryId;
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
