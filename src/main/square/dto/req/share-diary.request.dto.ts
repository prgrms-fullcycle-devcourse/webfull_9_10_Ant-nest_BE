import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class ShareDiaryRequestDto {
  @ApiProperty({
    example: true,
    description: "공유 상태 (true: 시작, false: 중단)",
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
