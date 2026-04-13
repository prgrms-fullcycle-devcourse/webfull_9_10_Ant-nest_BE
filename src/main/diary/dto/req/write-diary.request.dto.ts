import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ArrayMaxSize,
  IsEnum, MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EmotionType } from "@prisma/client";

export class WriteDiaryRequestDto {
  @ApiProperty({ example: "선물 같은 하루", description: "일기 제목" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  title: string;

  @ApiProperty({
    example: "오늘 점심에 먹은 떡볶이가 정말...",
    description: "일기 본문",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(700)
  content: string;

  @ApiProperty({
    enum: EmotionType,
    example: EmotionType.JOY,
    description: "감정 표현 (ANGRY, FLUTTER, JOY, PERPLEXED, SAD)",
  })
  @IsEnum(EmotionType, { message: "올바른 감정을 선택해주세요." })
  @IsNotEmpty({ message: "감정 선택은 필수입니다." })
  emotion: EmotionType;

  @ApiProperty({ example: "42", description: "답변한 질문 ID" })
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    example: ["url1", "url2"],
    description: "사진 URL 리스트 (최대 5장)",
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  photoUrls?: string[];
}
