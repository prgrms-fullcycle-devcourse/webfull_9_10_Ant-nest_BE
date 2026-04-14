import { ApiProperty } from "@nestjs/swagger";

import { EmotionInfoResponseDto } from "./emotion-info.response.dto";
import { DiaryPhotoResponseDto } from "./diary-photo.response.dto";

export class GetDiaryDetailResponseDto {
  @ApiProperty({ example: "105" })
  diaryId: string;

  @ApiProperty({ example: "선물 같은 하루" })
  title: string;

  @ApiProperty({ example: "오늘 점심에 먹은 떡볶이가 정말..." })
  content: string;

  @ApiProperty({ example: "2026-04-02" })
  diaryDate: string;

  @ApiProperty({ example: false })
  isEdited: boolean;

  @ApiProperty({ example: "2026-04-02T12:00:00.000Z" })
  createdAt: string;

  @ApiProperty({ example: null, nullable: true })
  updatedAt: string | null;

  @ApiProperty({ type: EmotionInfoResponseDto })
  emotion: EmotionInfoResponseDto;

  @ApiProperty({
    example: "오늘 당신의 마음을 따뜻하게 해준 순간은 언제였나요?",
  })
  question: string;

  @ApiProperty({ type: [DiaryPhotoResponseDto] })
  photos: DiaryPhotoResponseDto[];

  constructor(
    diaryId: string,
    title: string,
    content: string,
    diaryDate: string,
    isEdited: boolean,
    createdAt: string,
    updatedAt: string | null,
    emotion: EmotionInfoResponseDto,
    question: string,
    photos: DiaryPhotoResponseDto[],
  ) {
    this.diaryId = diaryId;
    this.title = title;
    this.content = content;
    this.diaryDate = diaryDate;
    this.isEdited = isEdited;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.emotion = emotion;
    this.question = question;
    this.photos = photos;
  }
}
