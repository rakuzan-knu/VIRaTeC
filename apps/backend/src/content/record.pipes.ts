import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { isRecordResource, type RecordResource } from '@viratec/contracts';

const RECORD_KEY_PATTERN = /^[A-Za-z0-9-]{1,120}$/;

@Injectable()
export class RecordResourcePipe implements PipeTransform<string, RecordResource> {
  transform(value: string) {
    if (!isRecordResource(value)) throw new BadRequestException('Unknown record type');
    return value;
  }
}

@Injectable()
export class RecordKeyPipe implements PipeTransform<string, string> {
  transform(value: string) {
    if (!RECORD_KEY_PATTERN.test(value)) throw new BadRequestException('Invalid record key');
    return value;
  }
}
