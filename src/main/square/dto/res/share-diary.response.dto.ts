import { ApiProperty } from "@nestjs/swagger";

export class ShareDiaryResponseDto {
  @ApiProperty({
    example: "33",
  })
  diaryId: string;

  @ApiProperty({
    example: "true",
  })
  isActive: boolean;

  constructor(diaryId: string, isActive: boolean) {
    this.diaryId = diaryId;
    this.isActive = isActive;
  }
}
