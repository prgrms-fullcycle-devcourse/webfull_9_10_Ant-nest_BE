export class CommonResponseDto<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  data: T | null;
  error: string | null;

  constructor(
    statusCode: number,
    path: string,
    message: string,
    data: T | null = null,
    error: string | null = null,
  ) {
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}