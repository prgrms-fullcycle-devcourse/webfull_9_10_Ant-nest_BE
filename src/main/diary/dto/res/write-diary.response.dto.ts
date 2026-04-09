import { ApiProperty } from "@nestjs/swagger";

export class WriteDiaryResponseDto {
  @ApiProperty({ example: "105" })
  diaryId: string;

  constructor(diaryId: string) {
    this.diaryId = diaryId;
  }
}
