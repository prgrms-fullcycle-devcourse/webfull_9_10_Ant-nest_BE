import {
  Module,
  Global,
} from "@nestjs/common";
import {
  S3Service,
} from "./s3.service";

@Global() // 전역 모듈로 설정하여 어디서든 S3Service를 주입받을 수 있게 합니다.
@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {
}