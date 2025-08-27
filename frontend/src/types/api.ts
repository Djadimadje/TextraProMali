/**
 * TypeScript type definitions for TexPro AI API
 * Generated based on Django backend models
 */

// Base types
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// User Management Types
export interface User extends BaseModel {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'supervisor' | 'technician' | 'inspector' | 'analyst';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  phone_number?: string;
  employee_id?: string;
  department?: string;
  site_location?: string;
  supervisor?: string;
  avatar?: string;
  bio?: string;
  last_activity?: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Machine Management Types
export interface MachineType extends BaseModel {
  name: string;
  description?: string;
  manufacturer?: string;
  typical_power_consumption?: number;
  typical_production_rate?: number;
  production_unit?: string;
  recommended_maintenance_interval_hours?: number;
  recommended_maintenance_interval_days?: number;
}

export interface Machine extends BaseModel {
  machine_id: string;
  name: string;
  machine_type: MachineType | number; // Can be object or just ID
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  installation_date?: string;
  building?: string;
  floor?: string;
  location_details?: string;
  operational_status: 'running' | 'idle' | 'maintenance' | 'breakdown' | 'offline';
  total_operating_hours: number;
  hours_since_maintenance: number;
  rated_power?: number;
  rated_capacity?: number;
  capacity_unit?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  primary_operator?: User;
  notes?: string;
  warranty_expiry?: string;
  purchase_cost?: string;
  site_code: string;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  // Computed properties from Django backend
  is_operational?: boolean;
  needs_maintenance?: boolean;
  maintenance_urgency?: 'normal' | 'due_soon' | 'urgent' | 'critical' | 'unknown';
}

// Workflow Management Types
export interface BatchWorkflow extends BaseModel {
  batch_code: string;
  batch_number?: string; // Computed field from backend
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  supervisor: User;
  product_type?: string; // Referenced in quality models
  current_stage?: string; // Referenced in quality models
  is_overdue: boolean;
  duration_days?: number;
  days_remaining?: number;
  progress_percentage?: number;
}

// Maintenance Management Types
export interface MaintenanceLog extends BaseModel {
  machine: Machine;
  technician: User;
  issue_reported: string;
  action_taken?: string;
  status: 'pending' | 'in_progress' | 'completed';
  reported_at: string;
  resolved_at?: string;
  next_due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  downtime_hours?: number;
  cost?: string;
  parts_replaced?: string;
  notes?: string;
  is_overdue: boolean;
  days_since_reported: number;
}

// Quality Control Types
export interface QualityCheck extends BaseModel {
  batch: BatchWorkflow;
  inspector: User;
  image: string;
  defect_detected: boolean;
  defect_type?: 'stain' | 'tear' | 'weave_error' | 'color_variation' | 'thread_break' | 'contamination' | 'sizing_issue' | 'density_variation';
  severity: 'low' | 'medium' | 'high';
  comments?: string;
  status: 'pending' | 'approved' | 'rejected';
  ai_analysis_requested: boolean;
  ai_analysis_result?: any;
  ai_confidence_score?: number;
  // Computed fields from backend
  defect_summary?: string;
  batch_info?: {
    batch_number: string;
    product: string;
    stage: string;
  };
  inspector_name?: string;
  batch_number?: string;
}

export interface QualityStandard extends BaseModel {
  product_type: 'cotton_fabric' | 'cotton_yarn' | 'blended_fabric' | 'dyed_fabric' | 'printed_fabric';
  max_defects_per_batch: number;
  critical_defect_tolerance: number;
  quality_threshold: number;
  thread_count_min?: number;
  thread_count_max?: number;
  weight_tolerance: number;
  color_fastness_grade: string;
}

export interface QualityMetrics extends BaseModel {
  date: string;
  total_checks: number;
  defects_found: number;
  batches_approved: number;
  batches_rejected: number;
  overall_quality_score: number;
  defect_rate: number;
  approval_rate: number;
  ai_accuracy?: number;
}

// Analytics Types
export interface SystemKPI {
  title: string;
  value: string;
  unit: string;
  change: string;
  changeType: 'positive' | 'negative';
  target: number;
  current: number;
}

export interface SystemStatus {
  system: string;
  status: string;
  statusColor: 'success' | 'warning' | 'danger';
  uptime: string;
  issues: number;
}

export interface Activity {
  id: number;
  type: 'system' | 'user' | 'alert' | 'production' | 'maintenance';
  message: string;
  user: string;
  time: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface APIError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Filter and Search Types
export interface MachineFilters {
  status?: string;
  machine_type?: string;
  site_code?: string;
  operational_status?: string;
  search?: string;
}

export interface MaintenanceFilters {
  status?: string;
  priority?: string;
  machine?: string;
  technician?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface QualityFilters {
  status?: string;
  defect_detected?: boolean;
  inspector?: string;
  batch?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface BatchFilters {
  status?: string;
  supervisor?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  machines: {
    total: number;
    active: number;
    maintenance: number;
    offline: number;
  };
  production: {
    daily_output: number;
    weekly_output: number;
    efficiency: number;
    quality_score: number;
  };
  maintenance: {
    pending: number;
    in_progress: number;
    overdue: number;
    completed_today: number;
  };
  quality: {
    checks_today: number;
    defect_rate: number;
    approval_rate: number;
    ai_accuracy: number;
  };
}

// Analyst-specific types
export interface AnalyticsMetrics {
  production: {
    daily_output: number;
    weekly_output: number;
    efficiency: number;
    trend: 'up' | 'down' | 'stable';
    change_percentage: number;
  };
  quality: {
    average_score: number;
    defect_rate: number;
    pass_rate: number;
    ai_accuracy: number;
  };
  machines: {
    total_utilization: number;
    average_uptime: number;
    performance_score: number;
    alerts_count: number;
  };
  workflow: {
    batches_completed: number;
    average_cycle_time: number;
    on_time_delivery: number;
    bottlenecks_identified: number;
  };
}

export interface RecentAnalysis {
  id: number;
  type: 'performance' | 'quality' | 'efficiency' | 'prediction';
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
  insights: string;
}
