import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignupRequestDto {
  @ApiProperty({
    example: "choonsik@naver.com",
    description: "사용자 이메일",
  })
  @IsEmail({}, { message: "올바른 이메일 형식이 아닙니다." })
  @IsNotEmpty({ message: "이메일은 필수 입력 항목입니다." })
  email: string;

  @ApiProperty({
    example: "춘식이",
    description: "사용자 닉네임 (2~8자, 한글/영문)",
  })
  @IsString()
  @Length(2, 8, { message: "닉네임은 2~8자 사이여야 합니다." })
  @Matches(/^[a-zA-Z가-힣]+$/, {
    message: "닉네임은 한글과 영문만 허용됩니다.",
  })
  nickname: string;

  @ApiProperty({
    example: "choonsik1@",
    description: "비밀번호 (8~14자, 영문/숫자/특수문자 조합)",
  })
  @IsString()
  @Length(8, 14, { message: "비밀번호는 8~14자 사이여야 합니다." })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,14}$/, {
    message:
      "비밀번호는 영문, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.",
  })
  password: string;

  @ApiProperty({
    example: "choonsik1@",
    description: "비밀번호 확인",
  })
  @IsString()
  @IsNotEmpty()
  checkPassword: string;
}
