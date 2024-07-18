class Detail {
  message: string;
  additionalProperties: Array<Record<string, any>>;
}

export class ExceptionDTO {
  timestamp: string;
  status: number;
  error: string;
  path: string;
  transactionId: string | null;
  message: string;
  code?: string;
  details?: Detail[];

  constructor(
    status: number,
    error: string,
    path: string,
    transactionId: string,
    message: string,
    details?: Detail[],
  ) {
    this.timestamp = new Date().toISOString();
    this.status = status;
    this.error = error;
    this.path = path;
    this.transactionId = transactionId;
    this.message = message;
    this.details = details;
  }
}
