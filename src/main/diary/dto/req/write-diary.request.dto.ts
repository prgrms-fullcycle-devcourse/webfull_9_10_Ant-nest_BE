import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EmotionType } from "@prisma/client";

export class WriteDiaryRequestDto {
  @ApiProperty({
    example: "선물 같은 하루",
    description: "일기 제목 (최대 30자)",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @ApiProperty({
    example: "오늘 점심에 먹은 떡볶이가 정말 맛있었어요...",
    description: "일기 본문 (최소 10자)",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(700)
  content: string;

  @ApiProperty({
    enum: EmotionType,
    example: EmotionType.HAPPY,
    description:
      "감정 표현 (ABSURD, ANGRY, BLANK, DEPRESSED, DISGUSTED, EXCITED, TIRED, HAPPY)",
  })
  @IsEnum(EmotionType)
  @IsNotEmpty()
  emotion: EmotionType;

  @ApiProperty({
    example: "1",
    description: "오늘의 질문 ID",
  })
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "이미지 파일 리스트 (최대 5장)",
    required: false,
  })
  images?: any[];
}
