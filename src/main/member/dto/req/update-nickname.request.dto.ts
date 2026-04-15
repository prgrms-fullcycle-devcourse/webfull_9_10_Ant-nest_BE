import { IsNotEmpty, IsString, Length, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateNicknameRequestDto {
  @ApiProperty({
    example: "라이언",
    description: "변경할 닉네임 (2~8자, 한글/영문만 허용)",
  })
  @IsString()
  @IsNotEmpty({ message: "닉네임을 입력해주세요." })
  @Length(2, 8, { message: "닉네임은 2~8자 사이여야 합니다." })
  @Matches(/^[a-zA-Z가-힣]+$/, {
    message: "닉네임은 한글과 영문만 허용됩니다.",
  })
  nickname: string;
}
