import { SetMetadata } from '@nestjs/common';
import { Constants } from '../../Constants';

/**
 * Decorator to mark all methods of a class as a traceable
 */
export const Traceable = (name?: string) =>
  SetMetadata(Constants.TRACE_METADATA, name);
