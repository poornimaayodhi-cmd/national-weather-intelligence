export type SourceType =
  | 'SOCIAL_MEDIA'
  | 'CITIZEN'
  | 'WEATHER_API'
  | 'PUBLIC_DATASET'
  | 'WEBSITE';

export type VerificationStatus =
  | 'PENDING'
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'REJECTED';

export type DuplicateStatus =
  | 'ORIGINAL'
  | 'SUSPECTED_DUPLICATE'
  | 'DUPLICATE';

export interface WeatherReport {
  report_id: string;
  source_platform: string;
  source_url: string;
  source_type: SourceType;
  author_name: string | null;
  content: string;
  timestamp: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  event_category: string;
  media_url: string | null;
  verification_status: VerificationStatus;
  AI_confidence: number | null;
  credibility_score: number;
  duplicate_status: DuplicateStatus;
  
  // Storage & Ingestion Metadata
  ingested_at: string;
  raw_payload?: Record<string, unknown>;
  duplicate_of_id?: string | null;
}

export interface IngestionStats {
  total_reports: number;
  by_source_type: Record<SourceType, number>;
  by_event_category: Record<string, number>;
  duplicates_count: number;
  verified_count: number;
  last_ingested_at: string | null;
}

export interface IngestionFilter {
  source_type?: SourceType | 'ALL';
  event_category?: string;
  search_query?: string;
  city?: string;
  duplicate_status?: DuplicateStatus | 'ALL';
}

// Raw source payloads schemas for different platforms:
export interface RawSocialMediaPayload {
  platform: 'Twitter/X' | 'Bluesky' | 'Threads';
  post_id: string;
  user_handle: string;
  display_name?: string;
  post_text: string;
  media_links?: string[];
  geo?: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
  };
  post_url?: string;
  created_at: string;
  has_video?: boolean;
}

export interface RawCitizenPayload {
  app_name: 'mPING' | 'CitizenSkyWarn' | 'CoCoRaHS' | 'CommunityWeather';
  observer_id: string;
  observer_alias?: string;
  observation_text: string;
  hazard_type: string;
  photo_url?: string;
  location: {
    city: string;
    state: string;
    lat: number;
    lon: number;
  };
  recorded_time: string;
  accuracy_meters?: number;
}

export interface RawWeatherApiPayload {
  service: 'OpenWeatherMap' | 'Tomorrow.io' | 'AccuWeather Alerts' | 'NWS API';
  alert_id: string;
  event_name: string;
  headline: string;
  description: string;
  area_desc: string;
  state_abbr?: string;
  centroid: {
    lat: number;
    lon: number;
  };
  api_endpoint: string;
  published_time: string;
}

export interface RawPublicDatasetPayload {
  agency: 'NOAA_NWS' | 'USGS_HYDRO' | 'FEMA_INCIDENTS';
  dataset_name: string;
  record_id: string;
  event_type: string;
  narrative: string;
  cz_name: string; // county or city
  state_alpha: string;
  begin_lat: number;
  begin_lon: number;
  record_timestamp: string;
  source_catalog_url: string;
}

export interface RawWebsitePayload {
  site_name: string;
  article_url: string;
  author_byline?: string;
  headline: string;
  body_text: string;
  publication_date: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  featured_media_url?: string;
}

// Module 2: Cross-Source Evidence Correlation & Verification Types

export interface ReportCorrelationMetric {
  report_id: string;
  source_type: SourceType;
  source_platform: string;
  author_name: string | null;
  content: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  distance_km: number;
  time_delta_minutes: number;
  reliability_score: number;
  is_supporting: boolean;
  is_conflicting: boolean;
  conflict_reason?: string;
  semantic_match_score: number;
}

export interface ConfidenceFactor {
  id: string;
  name: string;
  score_impact: number;
  type: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export interface ExplainableConfidence {
  overall_score: number; // 0 to 100
  confidence_level: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'DISPUTED';
  verdict: string;
  baseline_reliability: number;
  factors: ConfidenceFactor[];
  audit_summary: string;
  formula_expression: string;
}

export interface CorrelatedWeatherEvent {
  event_id: string;
  title: string;
  hazard_type: string;
  city: string;
  state: string;
  centroid_lat: number;
  centroid_lng: number;
  start_time: string;
  end_time: string;
  duration_hours: number;
  radius_km: number;

  // Grouping Criteria explanation
  grouping_reasons: {
    spatial_reason: string;
    temporal_reason: string;
    hazard_reason: string;
    semantic_reason: string;
  };

  // Reports Association
  supporting_report_ids: string[];
  conflicting_report_ids: string[];
  total_sources_count: number;
  source_types_present: SourceType[];

  // Deep metrics & breakdown
  report_metrics: ReportCorrelationMetric[];
  source_reliability_breakdown: Record<
    SourceType,
    { count: number; avg_reliability: number; weight: number }
  >;

  // Explainable Verification
  confidence: ExplainableConfidence;
  ai_synthesis?: {
    meteorological_summary: string;
    conflict_resolution: string;
    recommended_action: string;
    verified_at: string;
    model_used?: string;
  };
}

export interface CorrelationStats {
  total_events: number;
  highly_verified_events: number;
  disputed_events: number;
  total_correlated_reports: number;
  avg_confidence: number;
  sources_represented: Record<SourceType, number>;
}

// ============================================================================
// MODULE 3: AI Verification & Explainable Decision Support Types
// ============================================================================

export type VerificationConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type DecisionVerificationStatus =
  | 'EVIDENCE_SUPPORTED'
  | 'AI_ASSISTED_VERIFIED'
  | 'PROVISIONAL'
  | 'DISPUTED_UNVERIFIED'
  | 'INSUFFICIENT_EVIDENCE';

export interface VerificationFactorDetail {
  name: string;
  factor_key: string;
  score: number; // Normalized 0 - 100
  weight: number; // Relative weight in calculation
  weighted_contribution: number; // score * weight
  status: 'OPTIMAL' | 'MODERATE' | 'DEFICIT' | 'PENALTY';
  summary: string;
  metric_value: string;
}

export interface VerificationSourceBreakdown {
  report_id: string;
  source_platform: string;
  source_type: SourceType;
  author_name: string | null;
  content: string;
  is_official: boolean;
  has_media: boolean;
  media_url?: string | null;
  timestamp: string;
  distance_km: number;
  time_delta_mins: number;
  reliability_score: number;
  is_conflicting?: boolean;
  conflict_reason?: string;
}

export interface Module3VerificationResult {
  event_id: string;
  hazard: string;
  location: {
    city: string;
    state: string;
    centroid_lat: number;
    centroid_lng: number;
    radius_km: number;
  };
  time_window: {
    start_time: string;
    end_time: string;
    duration_hours: number;
  };

  // Explicit breakdown of supporting sources distinguishing Official vs Citizen/Social
  supporting_sources: {
    total_count: number;
    official_count: number;
    citizen_social_count: number;
    list: VerificationSourceBreakdown[];
  };

  // Conflicting sources
  conflicting_sources: {
    total_count: number;
    list: VerificationSourceBreakdown[];
  };

  // Explainable Confidence Score & Tier
  evidence_score: number; // 0 to 100
  confidence_level: VerificationConfidenceLevel; // HIGH / MEDIUM / LOW
  verification_status: DecisionVerificationStatus;

  // 9 Explicit Verification Factors Analyzed
  factors: {
    source_reliability: VerificationFactorDetail;
    independent_supporting_sources: VerificationFactorDetail;
    conflicting_sources: VerificationFactorDetail;
    spatial_proximity: VerificationFactorDetail;
    temporal_proximity: VerificationFactorDetail;
    hazard_type_consistency: VerificationFactorDetail;
    semantic_similarity: VerificationFactorDetail;
    image_video_evidence: VerificationFactorDetail;
    official_data_agreement: VerificationFactorDetail;
  };

  // Decision Support Explanations
  confidence_explanation: string;
  evidence_missing: string[];
  recommended_next_action: string;
  disclaimer: string;

  // Evidence Audit & Mathematical Ledger
  audit_ledger: Array<{
    step: number;
    title: string;
    points: number;
    formula_basis: string;
    description: string;
  }>;

  verified_at: string;
  model_assisted: boolean;
  independent_channels_count?: number;
  critical_conflict_resolved?: boolean;
  conflict_resolution_note?: string;
  official_confirmation?: 'YES' | 'NO' | 'PENDING';
  verification_sequence_completed?: boolean;
}

export interface VerificationModuleStats {
  total_events: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
  events_with_official_agreement: number;
  events_with_multimedia: number;
  events_with_conflicts: number;
  avg_evidence_score: number;
}

// ==========================================
// MODULE 4: OPERATIONAL DECISION SUPPORT TYPES
// ==========================================

export type EscalationLevel = 'MONITOR' | 'VERIFY' | 'PREPARE' | 'ESCALATE';

export interface TraceableEvidenceItem {
  id: string;
  category: 'OFFICIAL_BULLETIN' | 'CITIZEN_SPOTTER' | 'SOCIAL_DISPATCH' | 'MULTIMEDIA' | 'RADAR_SENSOR' | 'CONFLICTING_DISPUTE';
  summary: string;
  source_platform: string;
  source_type: SourceType;
  author_name: string | null;
  reliability: number;
  timestamp: string;
  weight_impact: string;
  is_official: boolean;
  has_media: boolean;
  media_url?: string | null;
}

export interface MissingEvidenceRequirement {
  item: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
  acquisition_method: string;
  target_system: string;
}

export interface RecommendedVerificationStep {
  step_title: string;
  description: string;
  action_owner: string;
  expected_outcome: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'ROUTINE';
}

export interface RecommendedOperationalAction {
  action_title: string;
  description: string;
  readiness_phase: string;
  stakeholders: string[];
  safety_note: string;
}

export interface TraceabilityPipelineStage {
  stage: 'EVIDENCE' | 'CONFIDENCE' | 'MISSING_EVIDENCE' | 'RECOMMENDED_ACTION';
  title: string;
  details: string;
  evidence_links: string[];
}

export interface SimulatedActionLogItem {
  id: string;
  timestamp: string;
  action_type: string;
  actor: string;
  notes: string;
}

export interface Module4EventActionDecision {
  event_id: string;
  hazard: string;
  location: {
    city: string;
    state: string;
    centroid_lat: number;
    centroid_lng: number;
    radius_km: number;
  };
  time_window: {
    start_time: string;
    end_time: string;
    duration_hours: number;
  };

  // 1. Current evidence confidence
  current_evidence_confidence: {
    score: number; // 0 - 100
    level: VerificationConfidenceLevel; // HIGH / MEDIUM / LOW
    summary: string;
  };

  // 2. Verification status
  verification_status: DecisionVerificationStatus;

  // 3. Supporting evidence
  supporting_evidence: {
    total_count: number;
    official_count: number;
    citizen_count: number;
    items: TraceableEvidenceItem[];
  };

  // 4. Conflicting evidence
  conflicting_evidence: {
    total_count: number;
    items: Array<{
      report_id: string;
      source_platform: string;
      conflict_reason: string;
      content: string;
      impact: string;
    }>;
  };

  // 5. Missing evidence
  missing_evidence: MissingEvidenceRequirement[];

  // 6. Recommended next verification step
  recommended_next_verification_step: RecommendedVerificationStep;

  // 7. Recommended operational action
  recommended_operational_action: RecommendedOperationalAction;

  // 8. Escalation level: Monitor / Verify / Prepare / Escalate
  escalation_level: EscalationLevel;
  escalation_rationale: string;
  escalation_triggers: string[];

  // Direct 4-Stage Action Pipeline: Evidence → Confidence → Missing Evidence → Recommended Action
  pipeline_trail: {
    evidence_stage: {
      headline: string;
      key_facts: string[];
      official_vs_citizen_summary: string;
    };
    confidence_stage: {
      headline: string;
      score: number;
      level: VerificationConfidenceLevel;
      key_drivers: string[];
    };
    missing_evidence_stage: {
      headline: string;
      gap_count: number;
      critical_gaps: string[];
    };
    recommended_action_stage: {
      headline: string;
      verification_priority: string;
      operational_posture: string;
    };
  };

  traceability_trail: TraceabilityPipelineStage[];
  simulated_actions_log: SimulatedActionLogItem[];

  generated_at: string;
  operational_disclaimer: string;
}

export interface Module4Stats {
  total_decisions: number;
  by_escalation: {
    MONITOR: number;
    VERIFY: number;
    PREPARE: number;
    ESCALATE: number;
  };
  by_confidence: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  official_backed_decisions: number;
  events_with_conflicts: number;
  actions_logged_count: number;
}
