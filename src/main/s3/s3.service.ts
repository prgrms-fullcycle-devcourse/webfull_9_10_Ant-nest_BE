import { Injectable } from "@nestjs/common";
import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";

import * as uuid from "uuid";

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get("AWS_REGION") ?? "ap-northeast-2",
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY") ?? "",
        secretAccessKey: this.configService.get<string>("AWS_SECRET_KEY") ?? "",
      },
    });
  }

  /**
   * 일기 사진 업로드
   * @param file Express.Multer.File
   * @returns 업로드된 S3 파일의 전체 URL 경로
   */
  public async uploadDiaryPhoto(file: Express.Multer.File): Promise<string> {
    const fileId = uuid.v4();
    // S3 내 저장 경로: diaries/uuid_파일명
    const fileKey = `diaries/${fileId}_${file.originalname}`;
    const bucketName = this.configService.get<string>("AWS_S3_BUCKET");
    const region = this.configService.get<string>("AWS_REGION");

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ACL: ObjectCannedACL.bucket_owner_full_control, // 혹은 public-read (버킷 설정에 따라 다름)
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // 반환할 이미지 주소 생성
    return `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
  }

  /**
   * S3 파일 삭제
   * @param filePath 삭제할 파일의 전체 URL
   */
  public async deleteFile(filePath: string): Promise<void> {
    if (!filePath) return;

    const bucketName = this.configService.get<string>("AWS_S3_BUCKET");

    // URL에서 Key(경로)만 추출 (amazonaws.com/ 이후의 문자열)
    const fileKey = filePath.split(".com/").pop();

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    await this.s3Client.send(command);
  }
}
