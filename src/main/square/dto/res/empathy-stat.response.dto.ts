import { ApiProperty } from "@nestjs/swagger";

export class EmpathyStatResponseDto {
  @ApiProperty({ example: "2", description: "공감 종류 ID" })
  typeId: string;

  @ApiProperty({ example: "설렘", description: "공감 명칭" })
  name: string;

  @ApiProperty({ example: 10, description: "해당 공감 누적 개수" })
  count: number;

  constructor(typeId: string, name: string, count: number) {
    this.typeId = typeId;
    this.name = name;
    this.count = count;
  }
}
