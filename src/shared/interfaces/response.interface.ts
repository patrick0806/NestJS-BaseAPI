export interface IMetadaResponse {
  timestamp: string;
  transactionId: string | null;
  path?: string;
  method?: string;
  statusCode?: number;
}
