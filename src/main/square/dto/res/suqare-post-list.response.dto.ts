import { ApiProperty } from "@nestjs/swagger";

import { EmpathyStatResponseDto } from "./empathy-stat.response.dto";
import { EmotionInfoResponseDto } from "../../../diary/dto/res/emotion-info.response.dto";

export class SquarePostListResponseDto {
  @ApiProperty({ example: "501" })
  postId: string;

  @ApiProperty({ example: "105" })
  diaryId: string;

  @ApiProperty({
    example: "오늘 하루 중 가장 크게 웃었던 순간은 언제인가요?",
    description: "질문 내용"
  })
  question: string;

  @ApiProperty({ example: "사당역에서 본 노을" })
  title: string;

  @ApiProperty({ example: "지하철역 계단을 올라오는데 노을이..." })
  content: string;

  @ApiProperty({ type: EmotionInfoResponseDto })
  emotion: EmotionInfoResponseDto; // 작성자의 8종 감정 (단순 표시용)

  @ApiProperty({ example: false })
  isMine: boolean;

  @ApiProperty({ example: true })
  isEdited: boolean;

  @ApiProperty({
    example: 6,
    description: "총 공감 개수 (SAD 2 + HAPPY 4 = 6)",
  })
  totalEmpathyCount: number;

  @ApiProperty({ type: [EmpathyStatResponseDto] })
  empathyStats: EmpathyStatResponseDto[]; // 5종 공감별 개수 상세

  @ApiProperty({ example: "2", nullable: true })
  myReactionId: string | null;

  @ApiProperty({ example: "10분 전", description: "상대적 공유 시간" })
  sharedAtRelative: string;

  constructor(
    postId: string,
    diaryId: string,
    question: string,
    title: string,
    content: string,
    emotion: EmotionInfoResponseDto,
    isMine: boolean,
    isEdited: boolean,
    sharedAtRelative: string,
    totalEmpathyCount: number,
    empathyStats: EmpathyStatResponseDto[],
    myReactionId: string | null,
  ) {
    this.postId = postId;
    this.diaryId = diaryId;
    this.question = question;
    this.title = title;
    this.content = content;
    this.emotion = emotion;
    this.isMine = isMine;
    this.isEdited = isEdited;
    this.sharedAtRelative = sharedAtRelative;
    this.totalEmpathyCount = totalEmpathyCount;
    this.empathyStats = empathyStats;
    this.myReactionId = myReactionId;
  }
}
