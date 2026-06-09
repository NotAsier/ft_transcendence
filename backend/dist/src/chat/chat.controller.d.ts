import { ChatMetrics } from './chat.metrics';
export declare class MetricsController {
    private readonly chatMetrics;
    constructor(chatMetrics: ChatMetrics);
    metrics(res: any): Promise<void>;
}
