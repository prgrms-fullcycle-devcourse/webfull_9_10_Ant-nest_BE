import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string, metadata: ArgumentMetadata): bigint {
    try {
      return BigInt(value);
    } catch (error) {
      throw new BadRequestException(
        `${metadata.data} 필드는 유효한 숫자 형식이어야 합니다.`,
      );
    }
  }
}
