import { ApiProperty } from "@nestjs/swagger";

import { DiarySummaryResponseDto } from "./diary-summary.response.dto";

export class GetAllDiariesResponseDto {
  @ApiProperty({ example: 42 })
  totalCount: number;

  @ApiProperty({ type: [DiarySummaryResponseDto] })
  diaries: DiarySummaryResponseDto[];

  constructor(totalCount: number, diaries: DiarySummaryResponseDto[]) {
    this.totalCount = totalCount;
    this.diaries = diaries;
  }
}
