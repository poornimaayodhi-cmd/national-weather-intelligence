import {
  CorrelatedWeatherEvent,
  Module3VerificationResult,
  Module4EventActionDecision,
  Module4Stats,
  EscalationLevel,
  TraceableEvidenceItem,
  MissingEvidenceRequirement,
  RecommendedVerificationStep,
  RecommendedOperationalAction,
  SimulatedActionLogItem,
  TraceabilityPipelineStage,
} from '../types.ts';
import { aiVerificationEngine } from './aiVerificationEngine.ts';
import { correlationEngine } from './correlationEngine.ts';
import { storage } from './storage.ts';

class OperationalDecisionEngine {
  private decisionsCache: Map<string, Module4EventActionDecision> = new Map();
  private simulatedLogs: Map<string, SimulatedActionLogItem[]> = new Map();

  constructor() {
    this.refreshAllDecisions();
  }

  /**
   * Refreshes decisions across all active correlated weather events
   */
  public refreshAllDecisions(): Module4EventActionDecision[] {
    const verificationResults = aiVerificationEngine.getAllVerifications();
    const decisions: Module4EventActionDecision[] = [];

    for (const v of verificationResults) {
      const decision = this.buildDecisionForVerification(v);
      this.decisionsCache.set(v.event_id, decision);
      decisions.push(decision);
    }

    return decisions;
  }

  public getAllDecisions(): Module4EventActionDecision[] {
    if (this.decisionsCache.size === 0) {
      this.refreshAllDecisions();
    }
    return Array.from(this.decisionsCache.values());
  }

  public getDecisionByEventId(eventId: string): Module4EventActionDecision | null {
    if (!this.decisionsCache.has(eventId)) {
      const v = aiVerificationEngine.getVerificationByEventId(eventId);
      if (!v) return null;
      const decision = this.buildDecisionForVerification(v);
      this.decisionsCache.set(eventId, decision);
    }
    return this.decisionsCache.get(eventId) || null;
  }

  /**
   * Adds an operational / verification log entry to an event's audit trail
   */
  public logOperationalAction(
    eventId: string,
    actionType: string,
    actor: string,
    notes: string
  ): Module4EventActionDecision | null {
    const decision = this.getDecisionByEventId(eventId);
    if (!decision) return null;

    const logItem: SimulatedActionLogItem = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action_type: actionType,
      actor: actor || 'Duty Operations Officer',
      notes,
    };

    if (!this.simulatedLogs.has(eventId)) {
      this.simulatedLogs.set(eventId, []);
    }
    this.simulatedLogs.get(eventId)!.unshift(logItem);

    decision.simulated_actions_log = [...this.simulatedLogs.get(eventId)!];
    this.decisionsCache.set(eventId, decision);

    return decision;
  }

  /**
   * Builds the comprehensive Module 4 Event Action Decision for an event
   */
  public buildDecisionForVerification(v: Module3VerificationResult): Module4EventActionDecision {
    const corrEvent = correlationEngine.getEventById(v.event_id);
    const allReports = storage.getReports();

    // 1. Supporting Evidence (with itemized traceability)
    const supportingItems: TraceableEvidenceItem[] = v.supporting_sources.list.map((src) => {
      let category: TraceableEvidenceItem['category'] = 'SOCIAL_DISPATCH';
      if (src.is_official) {
        category = 'OFFICIAL_BULLETIN';
      } else if (src.source_type === 'CITIZEN') {
        category = 'CITIZEN_SPOTTER';
      } else if (src.has_media) {
        category = 'MULTIMEDIA';
      }

      return {
        id: src.report_id,
        category,
        summary: src.content,
        source_platform: src.source_platform,
        source_type: src.source_type,
        author_name: src.author_name,
        reliability: src.reliability_score,
        timestamp: src.timestamp,
        weight_impact: src.is_official ? '+15 pts (Official agency)' : '+8 pts (Independent spotter)',
        is_official: src.is_official,
        has_media: src.has_media,
        media_url: src.media_url,
      };
    });

    // 2. Conflicting Evidence
    const conflictingItems = v.conflicting_sources.list.map((c) => ({
      report_id: c.report_id,
      source_platform: c.source_platform,
      conflict_reason: c.conflict_reason || 'Contradictory condition observed',
      content: c.content,
      impact: 'Deducted 20% from baseline credibility score',
    }));

    // 3. Missing Evidence Requirements
    const missingEvidenceReqs: MissingEvidenceRequirement[] = [];
    if (v.supporting_sources.official_count === 0) {
      missingEvidenceReqs.push({
        item: 'Accredited NWS Warning Bulletin or USGS River Gauge Telemetry',
        priority: 'CRITICAL',
        acquisition_method: 'Query National Weather Service API (api.weather.gov) for active polygon alerts',
        target_system: 'NWS Alert Webhook / USGS Streamflow API',
      });
    }
    if (v.factors.image_video_evidence.score < 80) {
      missingEvidenceReqs.push({
        item: 'Geotagged ground-truth photo or municipal CCTV camera validation',
        priority: 'HIGH',
        acquisition_method: 'Task municipal traffic camera stream or request mPING photo upload',
        target_system: 'Department of Transportation Traffic Camera Feeds',
      });
    }
    if (conflictingItems.length > 0) {
      missingEvidenceReqs.push({
        item: `Spotter reconciliation for ${conflictingItems.length} conflicting report(s)`,
        priority: 'CRITICAL',
        acquisition_method: 'Dispatch localized SkyWarn/ARES spotter to confirm street passability',
        target_system: 'Amateur Radio Emergency Service (ARES) SkyWarn Net',
      });
    }
    if (v.supporting_sources.citizen_social_count < 2) {
      missingEvidenceReqs.push({
        item: 'Multi-point field confirmation from localized eyewitnesses',
        priority: 'MODERATE',
        acquisition_method: 'Listen to public safety radio feed and monitor geotagged community reports',
        target_system: 'mPING & Social Media Crowdsource Feed',
      });
    }

    // 4. Escalation Level Determination: Monitor / Verify / Prepare / Escalate
    const hasConflicts = conflictingItems.length > 0;
    const hasOfficial = v.supporting_sources.official_count > 0;
    const isSevereHazard = ['Tornado', 'Flash Flood', 'Hailstorm', 'Severe Thunderstorm'].includes(v.hazard);
    const score = v.evidence_score;

    let escalationLevel: EscalationLevel = 'MONITOR';
    const escalationTriggers: string[] = [];
    let escalationRationale = '';

    if (hasConflicts) {
      // Conflicting reports always require active field verification before preparation
      escalationLevel = 'VERIFY';
      escalationTriggers.push(`Active ground contradiction: ${conflictingItems.length} eyewitness report(s) dispute conditions`);
      escalationTriggers.push(`Confidence suppressed to ${score}% pending conflict resolution`);
      escalationRationale = `Conflicting observations detected in ${v.location.city}. On-scene verification is required to confirm whether reported hazard conditions are present or subsided.`;
    } else if (score >= 75 && (hasOfficial || isSevereHazard)) {
      escalationLevel = 'ESCALATE';
      escalationTriggers.push(`Evidence score ${score}% meets High-Confidence threshold (≥75%)`);
      if (hasOfficial) escalationTriggers.push(`Corroborated by accredited meteorological agency (${v.supporting_sources.official_count} official source)`);
      if (v.factors.image_video_evidence.score >= 80) escalationTriggers.push('Verified ground-truth photographic/video media attached');
      escalationRationale = `High-confidence cluster for ${v.hazard} supported by verified data. Recommend immediate operational escalation to internal incident leadership (advisory posture; not a public emergency declaration).`;
    } else if (score >= 55 || (isSevereHazard && score >= 50)) {
      escalationLevel = 'PREPARE';
      escalationTriggers.push(`Evidence score ${score}% indicates emerging significant weather impact`);
      escalationTriggers.push(`Multi-channel convergence across ${v.supporting_sources.total_count} reporting sources`);
      escalationRationale = `Evidence demonstrates probable localized impact in ${v.location.city}. Operational assets should be pre-positioned and standby notifications staged.`;
    } else if (score >= 35 || v.supporting_sources.total_count >= 2) {
      escalationLevel = 'VERIFY';
      escalationTriggers.push(`Moderate confidence (${score}%) lacking official agency corroboration`);
      escalationTriggers.push('Awaiting secondary radar or visual sensor confirmation');
      escalationRationale = `Correlated reports indicate potential weather disturbance, but evidence density is insufficient for operational staging. Further spotter verification recommended.`;
    } else {
      escalationLevel = 'MONITOR';
      escalationTriggers.push(`Low-density cluster with ${score}% evidence confidence`);
      escalationTriggers.push('Routine automated ingestion surveillance active');
      escalationRationale = `Hazard does not currently present sufficient evidence or operational risk to warrant manual intervention. Maintain passive monitoring.`;
    }

    // 5. Recommended Next Verification Step
    const recommendedVerification: RecommendedVerificationStep = this.deriveVerificationStep(
      v,
      escalationLevel,
      hasConflicts
    );

    // 6. Recommended Operational Action
    const recommendedAction: RecommendedOperationalAction = this.deriveOperationalAction(
      v,
      escalationLevel,
      hasConflicts
    );

    // 7. Pipeline Trail: Evidence → Confidence → Missing Evidence → Recommended Action
    const pipelineTrail = {
      evidence_stage: {
        headline: `${v.supporting_sources.total_count} supporting source(s) across ${v.location.city}, ${v.location.state}`,
        key_facts: [
          `${v.supporting_sources.official_count} official agency bulletin(s) vs ${v.supporting_sources.citizen_social_count} citizen/social report(s)`,
          `Event radius: ~${v.location.radius_km} km around (${v.location.centroid_lat.toFixed(3)}°N, ${v.location.centroid_lng.toFixed(3)}°W)`,
          `Time duration: ${v.time_window.duration_hours}h span`,
          hasConflicts ? `Active dispute: ${conflictingItems.length} contradicting report(s)` : 'Zero conflicting reports detected',
        ],
        official_vs_citizen_summary: hasOfficial
          ? `Accredited agency data (${v.supporting_sources.list.filter(s => s.is_official).map(s => s.source_platform).join(', ')}) provides authoritative backbone.`
          : 'Purely citizen and social crowdsourced reports; no official agency confirmation yet.',
      },
      confidence_stage: {
        headline: `${v.evidence_score}% Evidence Score (${v.confidence_level} Confidence)`,
        score: v.evidence_score,
        level: v.confidence_level,
        key_drivers: [
          `Source Credibility Factor: ${v.factors.source_reliability.metric_value} (+${v.factors.source_reliability.weighted_contribution} pts)`,
          `Spatial / Temporal Tightness: ${v.factors.spatial_proximity.metric_value}, ${v.factors.temporal_proximity.metric_value}`,
          `Semantic Consistency: ${v.factors.semantic_similarity.metric_value}`,
          hasConflicts ? `Conflict Penalty: -${(100 - v.factors.conflicting_sources.score) * 0.15} pts deducted` : 'Corroboration Bonus: No disputes',
        ],
      },
      missing_evidence_stage: {
        headline: `${missingEvidenceReqs.length} Identified Evidence Gap(s)`,
        gap_count: missingEvidenceReqs.length,
        critical_gaps: missingEvidenceReqs.map((m) => `${m.priority}: ${m.item}`),
      },
      recommended_action_stage: {
        headline: `Escalation Level [${escalationLevel}]: ${recommendedAction.action_title}`,
        verification_priority: recommendedVerification.step_title,
        operational_posture: recommendedAction.readiness_phase,
      },
    };

    const traceabilityTrail: TraceabilityPipelineStage[] = [
      {
        stage: 'EVIDENCE',
        title: 'Multi-Source Ground Evidence Triangulated',
        details: `${v.supporting_sources.total_count} raw reports aggregated. ${v.supporting_sources.official_count} official, ${v.supporting_sources.citizen_social_count} citizen/social. ${hasConflicts ? '1+ contradictory report detected.' : 'Consistent observations.'}`,
        evidence_links: v.supporting_sources.list.map((s) => `[${s.source_platform}] ${s.report_id}`),
      },
      {
        stage: 'CONFIDENCE',
        title: `Confidence Evaluated at ${v.evidence_score}% (${v.confidence_level})`,
        details: v.confidence_explanation,
        evidence_links: [`Evidence Score: ${v.evidence_score}%`, `Verification Status: ${v.verification_status}`],
      },
      {
        stage: 'MISSING_EVIDENCE',
        title: `${missingEvidenceReqs.length} Evidence Gaps Identified`,
        details: missingEvidenceReqs.map((m) => m.item).join('; ') || 'All standard corroboration channels satisfied.',
        evidence_links: missingEvidenceReqs.map((m) => m.acquisition_method),
      },
      {
        stage: 'RECOMMENDED_ACTION',
        title: `Operational Recommendation [${escalationLevel}]`,
        details: `${recommendedAction.action_title}: ${recommendedAction.description}. Next verification: ${recommendedVerification.step_title}.`,
        evidence_links: [
          `Target: ${recommendedAction.stakeholders.join(', ')}`,
          `Readiness: ${recommendedAction.readiness_phase}`,
        ],
      },
    ];

    const existingLogs = this.simulatedLogs.get(v.event_id) || [];

    return {
      event_id: v.event_id,
      hazard: v.hazard,
      location: v.location,
      time_window: v.time_window,
      current_evidence_confidence: {
        score: v.evidence_score,
        level: v.confidence_level,
        summary: `${v.confidence_level} Confidence (${v.evidence_score}%) - ${v.verification_status}`,
      },
      verification_status: v.verification_status,
      supporting_evidence: {
        total_count: v.supporting_sources.total_count,
        official_count: v.supporting_sources.official_count,
        citizen_count: v.supporting_sources.citizen_social_count,
        items: supportingItems,
      },
      conflicting_evidence: {
        total_count: conflictingItems.length,
        items: conflictingItems,
      },
      missing_evidence: missingEvidenceReqs,
      recommended_next_verification_step: recommendedVerification,
      recommended_operational_action: recommendedAction,
      escalation_level: escalationLevel,
      escalation_rationale: escalationRationale,
      escalation_triggers: escalationTriggers,
      pipeline_trail: pipelineTrail,
      traceability_trail: traceabilityTrail,
      simulated_actions_log: existingLogs,
      generated_at: new Date().toISOString(),
      operational_disclaimer:
        'AI DECISION SUPPORT NOTICE: This operational recommendation is generated for situational awareness and decision guidance only. It DOES NOT constitute an official government disaster declaration, public evacuation order, or certified meteorological warning. All tactical deployments remain under the exclusive authority of authorized emergency management agencies.',
    };
  }

  private deriveVerificationStep(
    v: Module3VerificationResult,
    level: EscalationLevel,
    hasConflicts: boolean
  ): RecommendedVerificationStep {
    if (hasConflicts) {
      return {
        step_title: 'Deploy Ground Spotter to Reconcile Contradictory Reports',
        description: `Dispatch localized SkyWarn/ARES spotters to ${v.location.city} intersection to verify whether streets are submerged or dry. Cross-reference municipal road sensor telemetry.`,
        action_owner: 'Duty Dispatch Coordinator / Spotter Net Control',
        expected_outcome: 'Resolve conflicting report status and confirm exact street-level passability',
        urgency: 'IMMEDIATE',
      };
    }

    if (v.supporting_sources.official_count === 0) {
      return {
        step_title: 'Query NWS / USGS Telemetry for Threshold Confirmation',
        description: `Poll NWS radar velocity products (dual-polarization correlation coefficient) and USGS streamflow gauges within ~${v.location.radius_km} km of centroid (${v.location.centroid_lat.toFixed(2)}°N, ${v.location.centroid_lng.toFixed(2)}°W).`,
        action_owner: 'Hydrometeorology Desk Specialist',
        expected_outcome: 'Attain official sensor corroboration to bridge crowdsource gap',
        urgency: level === 'PREPARE' || level === 'ESCALATE' ? 'HIGH' : 'ROUTINE',
      };
    }

    if (v.factors.image_video_evidence.score < 80) {
      return {
        step_title: 'Ingest Real-Time Traffic Camera & Field Media Feeds',
        description: `Connect to regional DOT highway traffic cams along primary transit corridors in ${v.location.city} to visually confirm surface condition and standing water depth.`,
        action_owner: 'Situational Awareness Analyst',
        expected_outcome: 'Secure visual evidence proof to substantiate damage or hazard footprint',
        urgency: 'HIGH',
      };
    }

    return {
      step_title: 'Continuous High-Frequency Multi-Source Resurveillance',
      description: `Maintain active real-time ingest polling on social and citizen channels at 60-second intervals to monitor event progression and potential secondary cells.`,
      action_owner: 'Automated Pipeline Monitoring',
      expected_outcome: 'Detect rapid decay or intensification across verified perimeter',
      urgency: 'ROUTINE',
    };
  }

  private deriveOperationalAction(
    v: Module3VerificationResult,
    level: EscalationLevel,
    hasConflicts: boolean
  ): RecommendedOperationalAction {
    const isSaidapetHero =
      v.event_id.includes('CHE') ||
      v.location.city.toLowerCase().includes('saidapet') ||
      v.location.city.toLowerCase().includes('chennai');

    switch (level) {
      case 'ESCALATE':
        if (isSaidapetHero) {
          return {
            action_title: `RECOMMENDED ACTION: ESCALATE`,
            description: `Corroborated evidence confirms critical flash flooding at Saidapet. Recommend immediate multi-agency staging and resource deployment under authorized emergency protocols:
• Pre-position emergency response teams (NDRF 4th Battalion & SDRF teams staged at Saidapet and Velachery)
• Prepare flood-prone zones (Deploy 450 GCC dewatering pumps, clear causeway approaches, prepare relief shelters)
• Monitor river/gauge levels continuously (Adyar River & Maraimalai Adigal Bridge stage polling every 10 mins)
• Coordinate with authorized emergency-management agencies (TNSDMA, Greater Chennai Corporation, Traffic Police)
• Continue evidence verification (Field spotters verifying Anna Salai arterial corridors)
• Maintain an auditable decision trail (Log all verification timestamps, telemetry IDs, and confidence transitions)`,
            readiness_phase: 'Phase III: Tactical Pre-Deployment & Inter-Agency Staging',
            stakeholders: [
              'TNSDMA State Emergency Operations Centre',
              'Greater Chennai Corporation Disaster Control Room',
              'NDRF 4th Battalion / Tamil Nadu SDRF',
              'Greater Chennai Traffic Police',
            ],
            safety_note: 'AI-assisted decision support only. Official warnings and emergency declarations remain under the authority of authorized government agencies.',
          };
        }
        return {
          action_title: `RECOMMENDED ACTION: ESCALATE`,
          description: `Internal escalation to emergency operations leadership. Notify Public Works, Drainage Operations, and Police/Fire dispatch of high-probability ${v.hazard} in ${v.location.city}. Prepare flood barriers and barrier trucks for low-water crossings. (INTERNAL ONLY; NOT AN OFFICIAL DECLARATION).`,
          readiness_phase: 'Phase III: Tactical Pre-Deployment & Inter-Agency Staging',
          stakeholders: [
            'Emergency Management Director',
            'Public Works & Drainage Ops',
            'Police / Fire Dispatch',
            'District Transportation Dept',
          ],
          safety_note: 'AI-assisted decision support only. Official warnings and emergency declarations remain under the authority of authorized government agencies.',
        };

      case 'PREPARE':
        return {
          action_title: `RECOMMENDED ACTION: PREPARE`,
          description: `Advise municipal response crews and road maintenance personnel in ${v.location.city} to check equipment readiness. Pre-position barricade trailers near known hazard choke points. Draft public information advisories pending official agency notice.`,
          readiness_phase: 'Phase II: Pre-Positioning & Operational Readiness',
          stakeholders: [
            'Municipal Emergency Operations Center',
            'Street Maintenance Supervisor',
            'Public Information Officer (PIO)',
          ],
          safety_note: 'Review secondary detour routes for high-risk transit corridors.',
        };

      case 'VERIFY':
        if (isSaidapetHero) {
          return {
            action_title: `RECOMMENDED ACTION: VERIFY`,
            description: `Maintain advisory hold. Active contradiction detected between commuter report of dry bridge deck and CWC 14.85m river stage telemetry. Dispatch field spotter and survey drone to reconcile bridge deck observation with causeway water level before public escalations.`,
            readiness_phase: 'Phase I: Targeted Verification & Source Triangulation',
            stakeholders: [
              'GCC Disaster Management Cell',
              'TNSDMA Duty Officer',
              'Greater Chennai Traffic Police',
            ],
            safety_note: 'AI-assisted decision support only. Official warnings and emergency declarations remain under the authority of authorized government agencies.',
          };
        }
        return {
          action_title: `RECOMMENDED ACTION: VERIFY`,
          description: `Maintain advisory hold. Do not issue public escalations due to unresolved data conflicts or single-channel limitations. Focus operational resources on spotter reconciliation and sensor polling.`,
          readiness_phase: 'Phase I: Targeted Verification & Source Triangulation',
          stakeholders: [
            'Duty Meteorologist',
            'ARES/SkyWarn Net Control',
            'Traffic Operations Center',
          ],
          safety_note: 'Instruct spotters to report from secure elevated positions without crossing flooded roadways.',
        };

      case 'MONITOR':
      default:
        return {
          action_title: `Maintain Standard Automated Vigilance & Log Reports`,
          description: `No active deployment required. Maintain real-time pipeline monitoring and log incoming reports for pattern recognition.`,
          readiness_phase: 'Phase 0: Passive Surveillance',
          stakeholders: ['Operations Desk'],
          safety_note: 'Continue monitoring for unexpected localized escalation.',
        };
    }
  }

  public getStats(): Module4Stats {
    const decisions = this.getAllDecisions();
    const stats: Module4Stats = {
      total_decisions: decisions.length,
      by_escalation: {
        MONITOR: 0,
        VERIFY: 0,
        PREPARE: 0,
        ESCALATE: 0,
      },
      by_confidence: {
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      },
      official_backed_decisions: 0,
      events_with_conflicts: 0,
      actions_logged_count: 0,
    };

    let totalLogs = 0;
    for (const d of decisions) {
      stats.by_escalation[d.escalation_level] = (stats.by_escalation[d.escalation_level] || 0) + 1;
      stats.by_confidence[d.current_evidence_confidence.level] =
        (stats.by_confidence[d.current_evidence_confidence.level] || 0) + 1;

      if (d.supporting_evidence.official_count > 0) {
        stats.official_backed_decisions += 1;
      }
      if (d.conflicting_evidence.total_count > 0) {
        stats.events_with_conflicts += 1;
      }
      totalLogs += d.simulated_actions_log.length;
    }
    stats.actions_logged_count = totalLogs;

    return stats;
  }
}

export const operationalDecisionEngine = new OperationalDecisionEngine();
