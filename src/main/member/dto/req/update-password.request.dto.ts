import { IsNotEmpty, IsString, Length, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePasswordRequestDto {
  @ApiProperty({
    example: "choonsik1@",
    description: "현재 사용 중인 비밀번호",
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: "ryan1234@",
    description: "변경할 새 비밀번호 (8~14자, 영문/숫자/특수문자 필수)",
  })
  @IsString()
  @Length(8, 14, { message: "비밀번호는 8~14자 사이여야 합니다." })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,14}$/, {
    message:
      "비밀번호는 영문, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.",
  })
  newPassword: string;

  @ApiProperty({ example: "ryan1234!", description: "새 비밀번호 확인" })
  @IsString()
  @IsNotEmpty()
  checkPassword: string;
}
