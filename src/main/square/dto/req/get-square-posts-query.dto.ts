import { IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EmotionType } from "@prisma/client";

export enum SquareSortType {
  LATEST = "LATEST",
  POPULAR = "POPULAR",
}

export class GetSquarePostsQueryDto {
  @ApiProperty({
    enum: SquareSortType,
    example: SquareSortType.LATEST,
    description: "정렬 기준 (최신순: LATEST, 인기순: POPULAR)",
    required: false,
  })
  @IsOptional()
  @IsEnum(SquareSortType)
  sort?: SquareSortType = SquareSortType.LATEST;

  @ApiProperty({
    enum: EmotionType,
    example: EmotionType.HAPPY,
    description: "감정 필터 (특정 감정의 글만 보기)",
    required: false,
  })
  @IsOptional()
  @IsEnum(EmotionType)
  emotion?: EmotionType;
}
