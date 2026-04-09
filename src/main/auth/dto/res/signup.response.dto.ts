import {
  ApiProperty,
} from "@nestjs/swagger";

export class SignupResponseDto {
  @ApiProperty({
    example: "1",
    description: "생성된 사용자의 고유 식별자 (ID)",
  })
  memberId: string;

  constructor(memberId: string) {
    this.memberId = memberId;
  }
}