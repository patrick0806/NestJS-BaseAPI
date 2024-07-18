import { IncomingHttpHeaders } from 'node:http';

export function getHeader(headers: IncomingHttpHeaders, keyName: string) {
  if (!headers[keyName]) {
    return null;
  }

  const header = (headers[keyName] as string).split(' ');
  return header[1];
}
