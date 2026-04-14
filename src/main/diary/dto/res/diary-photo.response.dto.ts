import { ApiProperty } from "@nestjs/swagger";

export class DiaryPhotoResponseDto {
  @ApiProperty({ example: "1" })
  photoId: string;

  @ApiProperty({ example: "https://s3.dalrae.com/diaries/photo.jpg" })
  imageUrl: string;

  @ApiProperty({ example: 0 })
  displayOrder: number;

  constructor(photoId: string, imageUrl: string, displayOrder: number) {
    this.photoId = photoId;
    this.imageUrl = imageUrl;
    this.displayOrder = displayOrder;
  }
}
