import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEmpathyRequestDto {
  @ApiProperty({
    example: "2",
    description: "공감 종류 ID (1: 화남, 2: 설렘, 3: 신남, 4: 황당, 5: 슬픔)",
  })
  @IsNotEmpty()
  empathyTypeId: string;
}
