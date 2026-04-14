import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMaxSize,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EmotionType } from "@prisma/client";

export class UpdateDiaryRequestDto {
  @ApiProperty({ example: "수정된 제목", description: "최대 30자" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @ApiProperty({
    example: "내용을 보완합니다...",
    description: "최소 10자 ~ 700자",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(700)
  content: string;

  @ApiProperty({ enum: EmotionType, example: EmotionType.ABSURD })
  @IsEnum(EmotionType, { message: "올바른 감정 이모지를 선택해주세요." })
  @IsNotEmpty()
  emotion: EmotionType;

  @ApiProperty({ example: ["new_url1.jpg"], description: "수정된 사진 리스트" })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  photoUrls?: string[];
}
