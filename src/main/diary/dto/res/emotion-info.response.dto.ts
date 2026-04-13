import { ApiProperty } from "@nestjs/swagger";
import { EmotionType } from "@prisma/client";

export class EmotionInfoResponseDto {
  @ApiProperty({
    enum: EmotionType,
    example: EmotionType.JOY,
    description: "감정 타입 (Enum)",
  })
  type: EmotionType;

  @ApiProperty({
    example: "기쁨",
    description: "감정 한글 명칭",
  })
  name: string;

  constructor(type: EmotionType, name: string) {
    this.type = type;
    this.name = name;
  }
}
