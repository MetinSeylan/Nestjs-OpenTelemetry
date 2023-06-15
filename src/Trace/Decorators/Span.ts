import { SetMetadata } from '@nestjs/common';
import { Constants } from '../../Constants';

/**
 * A decorator to mark a method as a span
 * @param name The name of the span
 */
export const Span = (name?: string) =>
  SetMetadata(Constants.TRACE_METADATA, name);
