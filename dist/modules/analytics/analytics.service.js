"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const pool_1 = require("../../db/pool");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor() {
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    /**
     * Returns 24h analytics for a vehicle
     */
    async performance(vehicleId) {
        const ALERT_THRESHOLD = process.env.ALERT_THRESHOLD
            ? parseFloat(process.env.ALERT_THRESHOLD)
            : 85;
        // Single query: fetch vehicle history + corresponding meter history
        const query = `
      WITH vehicle_data AS (
        SELECT
          SUM(kwh_delivered_dc) AS dc,
          AVG(battery_temp) AS avg_temp,
          MIN(ts) AS first_ts,
          MAX(ts) AS last_ts
        FROM vehicle_history
        WHERE vehicle_id = $1
          AND ts > NOW() - interval '24 hours'
      ),
      meter_data AS (
        SELECT
          SUM(kwh_consumed_ac) AS ac
        FROM meter_history
        WHERE ts > NOW() - interval '24 hours'
          AND meter_id = $2
      )
      SELECT
        v.dc,
        v.avg_temp,
        v.first_ts,
        v.last_ts,
        m.ac
      FROM vehicle_data v
      CROSS JOIN meter_data m;
    `;
        // NOTE: Assumes vehicle_id = meter_id mapping; adjust if different
        const res = await pool_1.pool.query(query, [vehicleId, vehicleId]);
        const row = res.rows[0];
        // Handle empty history
        if (!row || row.first_ts === null || row.last_ts === null) {
            return {
                vehicleId,
                dcDelivered: 0,
                acConsumed: 0,
                efficiencyPercent: 0,
                avgBatteryTemp: 0,
                timeWindow: { from: null, to: null },
            };
        }
        const dc = parseFloat(row.dc || '0');
        const ac = parseFloat(row.ac || '0');
        const avgTemp = parseFloat(row.avg_temp || '0');
        const firstTs = row.first_ts;
        const lastTs = row.last_ts;
        const efficiency = ac > 0 ? parseFloat(((dc / ac) * 100).toFixed(2)) : 0;
        // Log warning if efficiency below threshold
        if (efficiency < ALERT_THRESHOLD) {
            this.logger.warn(`Efficiency dropped below ${ALERT_THRESHOLD}% for vehicle ${vehicleId}. DC: ${dc}, AC: ${ac}`);
        }
        return {
            vehicleId,
            dcDelivered: dc,
            acConsumed: ac,
            efficiencyPercent: efficiency,
            avgBatteryTemp: avgTemp,
            timeWindow: { from: firstTs, to: lastTs },
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)()
], AnalyticsService);
