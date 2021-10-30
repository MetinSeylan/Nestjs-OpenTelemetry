export declare abstract class BaseMetric {
    abstract name: string;
    abstract description: string;
    abstract inject(): Promise<void>;
}
