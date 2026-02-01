-- 1. Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 2. Live tables (hot, operational)
CREATE TABLE IF NOT EXISTS meter_live (
    meter_id TEXT PRIMARY KEY,
    kwh_consumed_ac DOUBLE PRECISION NOT NULL,
    voltage DOUBLE PRECISION NOT NULL,
    ts TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicle_live (
    vehicle_id TEXT PRIMARY KEY,
    soc SMALLINT NOT NULL CHECK (soc >= 0 AND soc <= 100),
    kwh_delivered_dc DOUBLE PRECISION NOT NULL,
    battery_temp DOUBLE PRECISION NOT NULL,
    ts TIMESTAMPTZ NOT NULL
);

-- 3. History tables (cold, append-only)
CREATE TABLE IF NOT EXISTS meter_history (
    id BIGSERIAL PRIMARY KEY,
    meter_id TEXT NOT NULL,
    kwh_consumed_ac DOUBLE PRECISION NOT NULL,
    voltage DOUBLE PRECISION NOT NULL,
    ts TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicle_history (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    soc SMALLINT NOT NULL CHECK (soc >= 0 AND soc <= 100),
    kwh_delivered_dc DOUBLE PRECISION NOT NULL,
    battery_temp DOUBLE PRECISION NOT NULL,
    ts TIMESTAMPTZ NOT NULL
);

-- 4. Convert history tables to hypertables
SELECT create_hypertable('meter_history', 'ts', chunk_time_interval => interval '1 day');
SELECT create_hypertable('vehicle_history', 'ts', chunk_time_interval => interval '1 day');

-- 5. Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_meter_history_meter_ts ON meter_history(meter_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_history_vehicle_ts ON vehicle_history(vehicle_id, ts DESC);
