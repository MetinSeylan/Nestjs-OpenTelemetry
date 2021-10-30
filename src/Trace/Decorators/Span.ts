import { SetMetadata } from '@nestjs/common';
import { Constants } from '../../Constants';

export const Span = (name?: string) =>
  SetMetadata(Constants.TRACE_METADATA, name);
