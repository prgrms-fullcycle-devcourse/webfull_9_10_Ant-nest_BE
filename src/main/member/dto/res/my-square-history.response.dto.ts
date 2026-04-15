import { ApiProperty } from "@nestjs/swagger";

export class MySquareHistoryResponseDto {
  @ApiProperty({ example: "501", description: "광장 게시글 ID" })
  postId: string;

  @ApiProperty({ example: "105", description: "연결된 일기 ID" })
  diaryId: string;

  @ApiProperty({ example: "사당역에서 본 노을", description: "일기 제목" })
  title: string;

  @ApiProperty({
    example: "지하철역 계단을 올라오는데...",
    description: "일기 본문 요약",
  })
  content: string;

  @ApiProperty({ example: 15, description: "해당 글이 받은 총 공감 수" })
  totalEmpathyCount: number;

  @ApiProperty({
    example: "2026-04-15T06:30:00.000+09:00",
    description: "광장 공유 시각",
  })
  sharedAt: string;

  @ApiProperty({ example: true, description: "현재 광장 노출 여부 (isActive)" })
  isActive: boolean;

  constructor(
    postId: string,
    diaryId: string,
    title: string,
    content: string,
    totalEmpathyCount: number,
    sharedAt: string,
    isActive: boolean,
  ) {
    this.postId = postId;
    this.diaryId = diaryId;
    this.title = title;
    this.content = content;
    this.totalEmpathyCount = totalEmpathyCount;
    this.sharedAt = sharedAt;
    this.isActive = isActive;
  }
}
