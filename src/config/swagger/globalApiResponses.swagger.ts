import { OpenAPIObject } from '@nestjs/swagger';
import { PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function GlobalApiResponses({
  document,
  excludedPaths,
  methods,
  responses,
}: {
  document: OpenAPIObject;
  excludedPaths: string[];
  methods: string[];
  responses: PathsObject;
}) {
  for (const key in document.paths) {
    if (!excludedPaths.includes(key)) {
      methods.forEach((method) => {
        if (document.paths[key][method]) {
          document.paths[key][method].responses = {
            ...responses,
            ...document.paths[key][method].responses,
          };
        }
      });
    }
  }
}
