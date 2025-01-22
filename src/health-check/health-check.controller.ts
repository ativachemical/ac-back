import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HealthCheckService } from './health-check.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('health-check')
@Controller('health-check')
export class HealthCheckController {
    constructor(
        private readonly healthCheckService: HealthCheckService,
    ) { }

    @Post('api')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async healthCheckApi() {
        return {
            "status": "UP",
            "version": "1.2.0",
            "uptime": "2 days 4 hours 32 minutes",
            "metrics": {
                "requestPerSecond": 120,
                "endpoints": [
                    {
                        "path": "/users",
                        "requests": 5000,
                        "averageLatencyMs": 120
                    },
                    {
                        "path": "/orders",
                        "requests": 3000,
                        "averageLatencyMs": 150
                    },
                    {
                        "path": "/products",
                        "requests": 2500,
                        "averageLatencyMs": 100
                    }
                ],
                "latency": {
                    "averageMs": 130,
                    "maxMs": 200,
                    "minMs": 90
                },
                "totalRequests": 10500
            },
            "resourceUsage": {
                "cpu": {
                    "usagePercentage": 65,
                    "limitPercentage": 90,
                },
                "memory": {
                    "usedMb": 2048,
                    "totalMb": 4096,
                    "limitMb": 4096
                }
            }
        }
    }

    @Post('database')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async healthCheckDatabase() {
        return {
            "status": "CONNECTED",
            "metrics": {
                "queryLatency": {
                    "averageMs": 15,
                    "maxMs": 30,
                    "minMs": 5
                },
                "diskUsage": {
                    "usedMb": 10240,
                    "totalMb": 20480,
                    "availableMb": 10240
                },
                "activeConnections": 25,
                "blockedTransactions": 3,
                "queryErrors": {
                    "total": 5,
                    "lastError": {
                        "timestamp": "2025-01-16T12:34:56Z",
                        "query": "SELECT * FROM users",
                        "errorMessage": "Timeout exceeded"
                    }
                }
            }
        }
    }
}
