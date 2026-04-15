import { ApiProperty } from "@nestjs/swagger";

export class CreateEmpathyResponseDto {
  @ApiProperty({
    example: "CREATED",
    description: "수행된 작업 (CREATED | UPDATED)",
  })
  action: string;

  @ApiProperty({ example: 152, description: "변경 후 게시물의 총 공감 지수" })
  currentScore: number;

  constructor(action: string, currentScore: number) {
    this.action = action;
    this.currentScore = currentScore;
  }
}
