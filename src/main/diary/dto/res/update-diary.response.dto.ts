import { ApiProperty } from "@nestjs/swagger";

export class UpdateDiaryResponseDto {
  @ApiProperty({ example: "105" })
  diaryId: string;

  @ApiProperty({ example: "2026-03-18T12:30:45.000Z" })
  updatedAt: string;

  constructor(diaryId: string, updatedAt: string) {
    this.diaryId = diaryId;
    this.updatedAt = updatedAt;
  }
}
