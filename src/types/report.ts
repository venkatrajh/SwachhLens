export type PriorityLevel = "low" | "medium" | "high" | "critical";
export type VolumeLevel = "small" | "medium" | "large" | "very_large";

export type ReportStatus = 
  | "pending"
  | "analyzing"
  | "assigned"
  | "in_progress"
  | "completed"
  | "verified"
  | "duplicate"
  | "escalated"
  | string;

export interface Report {
  id: string;
  user_id: string;
  image_url?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  description?: string;
  waste_type: string;
  volume: VolumeLevel;
  severity_score: number;
  priority: PriorityLevel;
  confidence?: number;
  duplicate: boolean;
  recommended_team?: string;
  recommended_vehicle?: string;
  recommended_action?: string;
  status: ReportStatus;
  
  // Cleanup & Verification extensions
  before_image_url?: string;
  after_image_url?: string;
  verified_at?: string;
  linked_report_id?: string;
  is_hazardous?: boolean;
  is_recyclable?: boolean;
}

export interface SubmitReportPayload {
  image?: File | Blob | string;
  video?: File | Blob | string;
  latitude: number;
  longitude: number;
  timestamp: string;
  description?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp?: number;
}
