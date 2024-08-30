import { Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

import { dataSource } from '@config/typeorm/dataSource';

export class InitialDataSeed {
  private logger: Logger;
  private queryRunner: QueryRunner;
  public async execute(): Promise<void> {
    this.logger = new Logger(InitialDataSeed.name);
    await this.initializeRepositories(dataSource);

    try {
      await this.queryRunner.startTransaction();
      await this.queryRunner.commitTransaction();
      this.logger.log('Transaction commited');
    } catch (error) {
      await this.queryRunner.rollbackTransaction();
      this.logger.error(error);
      this.logger.log('Transaction rolledback');
      throw error;
    } finally {
      await this.queryRunner.release(); // only in the last try and catch block
    }
  }

  private async initializeRepositories(dataSource: DataSource) {
    this.logger.log(this.initializeRepositories.name);

    await dataSource.initialize();
    //this.exampleRepository = dataSource.getRepository(Area);
    this.queryRunner = dataSource.createQueryRunner();
  }
}
