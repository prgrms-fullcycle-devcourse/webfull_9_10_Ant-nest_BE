import { ApiProperty } from "@nestjs/swagger";

export default class CustomResponse<T> {
  @ApiProperty({ type: Number, description: "HTTP 상태 코드" })
  statusCode: number;

  @ApiProperty({ type: String, description: "응답 시간" })
  timestamp: string;

  @ApiProperty({ type: String, description: "요청 경로" })
  path: string;

  @ApiProperty({ type: String, description: "응답 메시지" })
  readonly message: string;

  @ApiProperty({ description: "응답 데이터" })
  readonly data: T;

  @ApiProperty({ type: String, description: "에러 메시지", nullable: true })
  readonly error: string | null = null;

  constructor(data: T, message: string) {
    this.data = data;
    this.message = message;
  }
}
