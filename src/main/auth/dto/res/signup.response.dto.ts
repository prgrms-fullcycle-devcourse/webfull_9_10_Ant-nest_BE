import {
  ApiProperty,
} from "@nestjs/swagger";

export class SignupResponseDto {
  @ApiProperty({
    example: "1",
    description: "생성된 사용자의 고유 식별자 (ID)",
  })
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}