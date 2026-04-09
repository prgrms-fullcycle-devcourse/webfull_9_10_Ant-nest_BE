import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
  @ApiProperty({
    example: "1",
    description: "사용자 고유 식별자",
  })
  memberId: string;

  @ApiProperty({
    example: "달래",
    description: "사용자 닉네임",
  })
  nickname: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT 액세스 토큰",
  })
  accessToken: string;

  constructor(memberId: string, nickname: string, accessToken: string) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.accessToken = accessToken;
  }
}
