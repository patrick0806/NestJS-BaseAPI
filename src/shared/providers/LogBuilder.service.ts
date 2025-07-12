import { createLogger, transports, Logger, format } from 'winston';

import { ILogData, ILogParams } from '@shared/interfaces/log.interface';

export class LogBuilderService {
  private static instance: LogBuilderService;
  private logger: Logger;

  private constructor() {
    const appTransports: any = [
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),
    ];

    if (process.env.NODE_ENV === 'production') {
      appTransports.push(
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
      );
    }

    this.logger = createLogger({
      transports: appTransports,
    });
  }

  static getInstance(): LogBuilderService {
    if (!LogBuilderService.instance) {
      LogBuilderService.instance = new LogBuilderService();
    }
    return LogBuilderService.instance;
  }

  public build(params: ILogParams) {
    const log: ILogData = { ...params } //TODO - add logic to calculate duration;

    this.logger.log(log.level, JSON.stringify(log, null, 2));
  }
}
