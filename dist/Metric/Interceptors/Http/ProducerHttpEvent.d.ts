import { HttpStatus } from '@nestjs/common';
export interface ProducerHttpEvent {
    time: number;
    labels: {
        exception: string;
        method: string;
        outcome: Outcome;
        status: HttpStatus;
        uri: string;
    };
}
export declare enum Outcome {
    INFORMATIONAL = "INFORMATIONAL",
    SUCCESS = "SUCCESS",
    REDIRECTION = "REDIRECTION",
    CLIENT_ERROR = "CLIENT_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
    UNKNOWN = "UNKNOWN"
}
