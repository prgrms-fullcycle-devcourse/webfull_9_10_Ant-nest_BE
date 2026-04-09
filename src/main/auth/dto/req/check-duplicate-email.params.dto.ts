import {
    ApiProperty,
} from "@nestjs/swagger";
import {
    IsEmail,
} from "class-validator";

export default class CheckDuplicateEmailParamsDto {
    @ApiProperty({
        type: String,
        description: "중복 확인할 이메일 정보",
        required: true,
        example: "test123@naver.com",
    })
    @IsEmail({},{
        message: "이메일은 비어있으면 안되며, 문자열 형식이어야 합니다.",
    })
    readonly email: string;
}