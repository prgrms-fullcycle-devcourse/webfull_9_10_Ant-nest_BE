import { ApiProperty } from "@nestjs/swagger";

import { EmotionInfoResponseDto } from "./emotion-info.response.dto";

export class DiarySummaryResponseDto {
  @ApiProperty({ example: "105" })
  diaryId: string;

  @ApiProperty({ example: "선물 같은 하루" })
  title: string;

  @ApiProperty({ example: "2026-04-02" })
  diaryDate: string;

  @ApiProperty({ example: false })
  isEdited: boolean;

  @ApiProperty({ type: EmotionInfoResponseDto })
  emotion: EmotionInfoResponseDto;

  @ApiProperty({
    example: "오늘 당신의 마음을 따뜻하게 해준 순간은 언제였나요?",
  })
  question: string;

  constructor(
    diaryId: string,
    title: string,
    diaryDate: string,
    isEdited: boolean,
    emotion: EmotionInfoResponseDto,
    question: string,
  ) {
    this.diaryId = diaryId;
    this.title = title;
    this.diaryDate = diaryDate;
    this.isEdited = isEdited;
    this.emotion = emotion;
    this.question = question;
  }
}
