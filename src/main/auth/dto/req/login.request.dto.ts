import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginRequestDto {
  @ApiProperty({
    example: "choonsik@naver.com",
    description: "사용자 이메일",
  })
  @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다." })
  @IsNotEmpty({ message: "이메일을 입력해주세요." })
  email: string;

  @ApiProperty({
    example: "choonsik1@",
    description: "비밀번호",
  })
  @IsString()
  @IsNotEmpty({ message: "비밀번호를 입력해주세요." })
  password: string;
}
