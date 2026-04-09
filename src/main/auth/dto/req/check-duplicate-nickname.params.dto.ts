import {
    ApiProperty,
} from "@nestjs/swagger";
import {
    IsNotEmpty, IsString, Matches,
} from "class-validator";

export default class CheckDuplicateNicknameParamsDto {
    @ApiProperty({
        type: String,
        description: "중복 확인할 닉네임 정보",
        required: true,
        minLength: 2,
        maxLength: 8,
        example: "nickname",
    })
    @IsNotEmpty({
        message: "닉네임은 비어있으면 안됩니다.",
    })
    @IsString({
        message: "닉네임은 문자열이어야 합니다.",
    })
    @Matches(/^[a-zA-Z0-9가-힣]{2,8}$/, {
        message: "닉네임은 2~8글자의 한글 또는 영문자, 숫자여야 합니다.",
    })
    readonly nickname: string;
}