import {
    ApiProperty,
} from "@nestjs/swagger";

export default class CheckDuplicateEmailResponseDto {
    @ApiProperty({
        type: Boolean,
        description: "중복 확인한 이메일에 대한 결과",
        required: true,
        example: true,
    })
    readonly result: boolean;

    constructor(result: boolean) {
        this.result = result;
    }
}