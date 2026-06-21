import {
  InferInsertModel,
  InferSelectModel,
  SQL,
  count,
  eq,
} from 'drizzle-orm';
import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';

import type { DrizzleDatabase } from '@config/database/database.module';

import {
  PaginatedResponse,
  PaginationDto,
} from '@shared/dtos';

type BaseEntityColumns = {
  id: PgColumn;
  createdAt: PgColumn;
  updatedAt: PgColumn;
};

export type TableWithBase = PgTableWithColumns<any> & BaseEntityColumns;

export abstract class BaseRepository<
  TTable extends PgTableWithColumns<any>,
  TSelect = InferSelectModel<TTable>,
  TInsert = InferInsertModel<TTable>,
> {
  readonly #baseColumns: TTable extends TableWithBase
    ? true
    : 'TableWithBase constraint violated: table must include id, createdAt, updatedAt columns from baseEntity.' = true as never;

  constructor(
    protected readonly db: DrizzleDatabase,
    protected readonly table: TTable,
  ) {
    void this.#baseColumns;
  }

  private get idColumn(): PgColumn {
    return (this.table as unknown as TableWithBase).id;
  }

  async findById(id: string): Promise<TSelect | null> {
    const rows = await this.db
      .select()
      .from(this.table as PgTableWithColumns<any>)
      .where(eq(this.idColumn, id))
      .limit(1);

    return (rows[0] as TSelect | undefined) ?? null;
  }

  async list(
    pagination: PaginationDto,
    where?: SQL,
  ): Promise<PaginatedResponse<TSelect>> {
    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;

    const table = this.table as PgTableWithColumns<any>;

    const [rows, totalRow] = await Promise.all([
      this.db
        .select()
        .from(table)
        .where(where)
        .limit(pageSize)
        .offset(offset),
      this.db.select({ value: count() }).from(table).where(where),
    ]);

    const totalElements = Number(totalRow[0]?.value ?? 0);
    const totalPages =
      totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);

    return {
      page,
      pageSize,
      totalElements,
      totalPages,
      content: rows as TSelect[],
    };
  }

  async save(
    data: Partial<Omit<TInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<TSelect> {
    const [row] = await this.db
      .insert(this.table as PgTableWithColumns<any>)
      .values(data as unknown as TInsert)
      .returning();

    return row as TSelect;
  }

  async update(
    id: string,
    data: Partial<Omit<TInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<TSelect | null> {
    const [row] = await this.db
      .update(this.table as PgTableWithColumns<any>)
      .set({ ...data, updatedAt: new Date() } as unknown as Partial<TInsert>)
      .where(eq(this.idColumn, id))
      .returning();

    return (row as TSelect | undefined) ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(this.table as PgTableWithColumns<any>)
      .where(eq(this.idColumn, id));
  }
}
