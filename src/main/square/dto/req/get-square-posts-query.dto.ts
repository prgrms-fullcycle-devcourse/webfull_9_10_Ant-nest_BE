import { IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
}
