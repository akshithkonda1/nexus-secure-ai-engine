export interface SnapshotRecord {
  snapshot_id: string;
  run_id: string;
  summary: string;
  created_at: string;
  payload: Record<string, unknown>;
}

export interface TestRun {
  run_id: string;
  test_type: string;
  scope: string;
  status: string;
  duration: number;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface WarRoomEvent {
  severity: string;
  message: string;
  action: string;
  created_at: string;
}
