import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaginationSchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1)
      .describe('1-indexed page number. Defaults to 1.'),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(10)
      .describe(
        'Number of items returned per page. Capped at 100. Defaults to 10.',
      ),
  })
  .describe(
    'Pagination parameters consumed by list endpoints. `page` is 1-indexed and `pageSize` controls how many records are returned per page.',
  );

export class PaginationDto extends createZodDto(PaginationSchema) {}

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z
    .object({
      page: z.number().int().positive().describe('Current page number.'),
      pageSize: z
        .number()
        .int()
        .positive()
        .describe('Number of items requested per page.'),
      totalElements: z
        .number()
        .int()
        .nonnegative()
        .describe('Total number of records matching the query.'),
      totalPages: z
        .number()
        .int()
        .nonnegative()
        .describe('Total number of pages available given `pageSize`.'),
      content: z.array(item).describe('Items for the current page.'),
    })
    .describe('Generic paginated response wrapper.');

export type PaginatedResponse<T> = {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: T[];
};
