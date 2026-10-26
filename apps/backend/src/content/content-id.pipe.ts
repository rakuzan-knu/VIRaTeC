import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { CONTENTFUL_ID_PATTERN } from './dto/content-editor.dto';

@Injectable()
export class ContentIdPipe implements PipeTransform<string, string> {
  transform(value: string) {
    if (!CONTENTFUL_ID_PATTERN.test(value)) throw new BadRequestException('Invalid content id');
    return value;
  }
}
