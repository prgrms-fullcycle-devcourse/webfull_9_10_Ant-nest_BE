import {
    ApiProperty,
} from "@nestjs/swagger";

export default class CheckDuplicateNicknameResponseDto {
    @ApiProperty({
        type: Boolean,
        description: "중복 확인한 닉네임에 대한 결과",
        required: true,
        example: true,
    })
    readonly result: boolean;

    constructor(result: boolean) {
        this.result = result;
    }
}