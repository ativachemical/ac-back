export interface RecaptchaResponse {
    name: string;
    event: {
        token: string;
        siteKey: string;
        expectedAction: string;
        userAgent: string;
    };
    riskAnalysis: {
        score: number;
        reasons: string[];
    };
    tokenProperties: {
        valid: boolean;
        hostname: string;
        action: string;
    };
}
