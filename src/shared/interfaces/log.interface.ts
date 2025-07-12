export interface ILogParams {
  code: string;
  message: string;
  details: any;
  level: 'info' | 'error' | 'warn' | 'debug';
  method: string;
  path: string;
  timestamp: string;
  transactionId: string;
  statusCode: number;
}

export interface ILogData {
  code: string;
  message: string;
  details: any;
  level: 'info' | 'error' | 'warn' | 'debug';
  method: string;
  path: string;
  timestamp: string;
  transactionId: string;
  statusCode: number;
}
