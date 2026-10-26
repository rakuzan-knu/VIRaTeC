import { HttpException } from '@nestjs/common';

export const hasStatus =
  (status: number) =>
  (error: unknown): boolean =>
    error instanceof HttpException && error.getStatus() === status;

export const hasCode =
  (status: number, code: string) =>
  (error: unknown): boolean => {
    if (!(error instanceof HttpException) || error.getStatus() !== status) return false;
    const response = error.getResponse();
    return typeof response === 'object' && 'code' in response && response.code === code;
  };
