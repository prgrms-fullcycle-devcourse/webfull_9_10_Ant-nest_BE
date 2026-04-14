import { ApiProperty } from "@nestjs/swagger";

export class CheckTodayDiaryResponseDto {
  @ApiProperty({
    example: true,
    description: "오늘 일기 작성 여부",
  })
  isWritten: boolean;

  @ApiProperty({
    example: "105",
    description: "작성한 일기 ID (작성하지 않았을 경우 null)",
    nullable: true,
  })
  diaryId: string | null;

  constructor(isWritten: boolean, diaryId: string | null) {
    this.isWritten = isWritten;
    this.diaryId = diaryId;
  }
}
