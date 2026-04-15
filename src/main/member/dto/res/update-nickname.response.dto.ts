import { ApiProperty } from "@nestjs/swagger";

export class UpdateNicknameResponseDto {
  @ApiProperty({ example: "라이언" })
  nickname: string;

  constructor(nickname: string) {
    this.nickname = nickname;
  }
}
