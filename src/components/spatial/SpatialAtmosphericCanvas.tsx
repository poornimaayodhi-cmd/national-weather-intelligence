import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Compass,
  Radio,
  Eye,
  Layers,
  Sparkles,
  AlertTriangle,
  CloudRain,
  ShieldCheck,
  Zap,
  Navigation,
  Globe,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Wind,
  Thermometer,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { INDIA_STATE_REGIONS, IndiaStateRegion } from './stateGeometries.ts';

export type GlobeViewMode = 'RADAR' | 'SATELLITE' | 'EVENTS' | 'THREAT';

export interface SpatialEventNode {
  id: string;
  title: string;
  category: 'SEVERE' | 'RAINFALL' | 'THUNDERSTORM' | 'HEATWAVE' | 'VERIFIED';
  city: string;
  state: string;
  lat: number;
  lng: number;
  confidence: number;
  sourcesCount: number;
  status: 'VERIFIED' | 'ACTION_REQUIRED' | 'PROVISIONAL';
  timestamp: string;
  severityColor: string;
  details: string;
}

export const SPATIAL_EVENT_NODES: SpatialEventNode[] = [
  {
    id: 'EVT-CHE-2026-001',
    title: 'Severe Thunderstorm & Inundation',
    category: 'SEVERE',
    city: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    confidence: 91,
    sourcesCount: 12,
    status: 'ACTION_REQUIRED',
    timestamp: '21:32 IST',
    severityColor: '#EF4444', // Red
    details: 'Urban flash inundation in Saidapet & Velachery; Adyar river gauge 1.1m above danger mark. NDRF 4th Bn deployed.',
  },
  {
    id: 'EVT-CHE-2026-002',
    title: 'Monsoon Cloudburst Band',
    category: 'RAINFALL',
    city: 'Meenambakkam',
    state: 'Tamil Nadu',
    lat: 12.9868,
    lng: 80.1772,
    confidence: 96,
    sourcesCount: 9,
    status: 'VERIFIED',
    timestamp: '21:15 IST',
    severityColor: '#06B6D4', // Cyan
    details: 'Dual-frequency IMD Doppler radar recording 52 dBZ convective core; 48mm/hr precipitation rate.',
  },
  {
    id: 'EVT-MUM-2026-003',
    title: 'Heavy Rainfall & Coastal Squall',
    category: 'RAINFALL',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.076,
    lng: 72.8777,
    confidence: 87,
    sourcesCount: 8,
    status: 'VERIFIED',
    timestamp: '20:50 IST',
    severityColor: '#F97316', // Orange
    details: 'Arabian Sea coastal squall line; wind gusts 58 km/h, wave heights 3.5m, heavy localized downpours.',
  },
  {
    id: 'EVT-BLR-2026-004',
    title: 'Convective Thunderstorm',
    category: 'THUNDERSTORM',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    confidence: 84,
    sourcesCount: 6,
    status: 'VERIFIED',
    timestamp: '20:30 IST',
    severityColor: '#A855F7', // Violet
    details: 'Urban thermodynamic convection with rapid 32mm rainfall across Bellandur catchment basin.',
  },
  {
    id: 'EVT-DEL-2026-005',
    title: 'Ground Truth Observatory',
    category: 'VERIFIED',
    city: 'New Delhi',
    state: 'Delhi (NCT)',
    lat: 28.5833,
    lng: 77.2,
    confidence: 98,
    sourcesCount: 14,
    status: 'VERIFIED',
    timestamp: '21:40 IST',
    severityColor: '#10B981', // Emerald
    details: 'Safdarjung Observatory baseline locked; 1012 hPa barometric reference, temp 33.6°C, humidity 54%.',
  },
  {
    id: 'EVT-ODI-2026-006',
    title: 'Mesoscale Lightning Squall',
    category: 'THUNDERSTORM',
    city: 'Balasore',
    state: 'Odisha',
    lat: 21.4934,
    lng: 86.9135,
    confidence: 86,
    sourcesCount: 7,
    status: 'PROVISIONAL',
    timestamp: '20:15 IST',
    severityColor: '#8B5CF6', // Purple
    details: 'Bay of Bengal convective squall line tracking inland with frequent cloud-to-ground lightning discharges.',
  },
  {
    id: 'EVT-ASM-2026-007',
    title: 'River Basin Surge Watch (Flood Risk)',
    category: 'SEVERE',
    city: 'Guwahati',
    state: 'Assam',
    lat: 26.1445,
    lng: 91.7362,
    confidence: 89,
    sourcesCount: 11,
    status: 'ACTION_REQUIRED',
    timestamp: '19:45 IST',
    severityColor: '#3B82F6', // Blue
    details: 'Brahmaputra tributary inflows high; automated ultrasonic level sensor +1.4m surge, SDRF flood watch.',
  },
  {
    id: 'EVT-VIZ-2026-008',
    title: 'Cyclonic Moisture Inflow',
    category: 'RAINFALL',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lng: 83.2185,
    confidence: 88,
    sourcesCount: 8,
    status: 'VERIFIED',
    timestamp: '20:05 IST',
    severityColor: '#0EA5E9', // Sky Blue
    details: 'Eastern sea-board moisture tongue; coastal AWS recording sustained 42 km/h winds and low-level cloud base.',
  },
  {
    id: 'EVT-AHM-2026-009',
    title: 'Thermal Shear & Dry Gusts',
    category: 'HEATWAVE',
    city: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    confidence: 85,
    sourcesCount: 7,
    status: 'PROVISIONAL',
    timestamp: '18:50 IST',
    severityColor: '#F59E0B', // Amber
    details: 'Localized thermal convection gradient; surface thermometer 40.8°C with gusty northwesterly dust plumes.',
  },
];

// Multi-Source Ingestion Feeds for Layer 02
interface MultiSourceBeacon {
  id: string;
  sourceType: 'IMD AWS' | 'TWITTER / X' | 'CITIZEN SPOTTER' | 'RIVER GAUGE' | 'TRAFFIC CCTV';
  lat: number;
  lng: number;
  label: string;
  color: string;
}

const MULTI_SOURCE_BEACONS: MultiSourceBeacon[] = [
  { id: 'SRC-01', sourceType: 'IMD AWS', lat: 13.08, lng: 80.27, label: 'IMD Nungambakkam AWS', color: '#06B6D4' },
  { id: 'SRC-02', sourceType: 'TWITTER / X', lat: 13.02, lng: 80.22, label: '@chennairains Spotter Geo', color: '#38BDF8' },
  { id: 'SRC-03', sourceType: 'RIVER GAUGE', lat: 13.01, lng: 80.21, label: 'Adyar River Telemetry Sensor', color: '#6366F1' },
  { id: 'SRC-04', sourceType: 'TRAFFIC CCTV', lat: 13.04, lng: 80.24, label: 'Anna Salai Inundation Cam', color: '#10B981' },
  { id: 'SRC-05', sourceType: 'CITIZEN SPOTTER', lat: 12.98, lng: 80.25, label: 'Thiruvanmiyur Volunteer Ping', color: '#F59E0B' },
  { id: 'SRC-06', sourceType: 'IMD AWS', lat: 18.90, lng: 72.82, label: 'Colaba AWS Baseline', color: '#06B6D4' },
  { id: 'SRC-07', sourceType: 'TWITTER / X', lat: 19.12, lng: 72.83, label: 'Mumbai Live Weather Hashtag', color: '#38BDF8' },
  { id: 'SRC-08', sourceType: 'CITIZEN SPOTTER', lat: 19.05, lng: 72.85, label: 'Bandra Bandstand Sea Spotter', color: '#F59E0B' },
  { id: 'SRC-09', sourceType: 'IMD AWS', lat: 12.95, lng: 77.65, label: 'Bengaluru HAL Observatory', color: '#06B6D4' },
  { id: 'SRC-10', sourceType: 'CITIZEN SPOTTER', lat: 12.92, lng: 77.68, label: 'Bellandur Lake Volunteer Node', color: '#F59E0B' },
  { id: 'SRC-11', sourceType: 'IMD AWS', lat: 28.58, lng: 77.20, label: 'Safdarjung National Baseline', color: '#06B6D4' },
  { id: 'SRC-12', sourceType: 'RIVER GAUGE', lat: 26.18, lng: 91.75, label: 'CWC Brahmaputra Pandu Station', color: '#6366F1' },
  { id: 'SRC-13', sourceType: 'CITIZEN SPOTTER', lat: 26.15, lng: 91.78, label: 'Guwahati Ward 14 Flood Ping', color: '#F59E0B' },
  { id: 'SRC-14', sourceType: 'IMD AWS', lat: 21.49, lng: 86.91, label: 'Balasore Doppler Coastal AWS', color: '#06B6D4' },
  { id: 'SRC-15', sourceType: 'IMD AWS', lat: 17.68, lng: 83.21, label: 'Vizag Port Maritime Anemometer', color: '#06B6D4' },
  { id: 'SRC-16', sourceType: 'IMD AWS', lat: 23.02, lng: 72.57, label: 'Ahmedabad Airport AWS', color: '#06B6D4' },
];

export interface FocusTargetCoords {
  lat: number;
  lng: number;
  zoom?: number;
  timestamp?: number;
}

interface SpatialAtmosphericCanvasProps {
  onSelectEvent: (event: SpatialEventNode) => void;
  selectedEventId?: string | null;
  activeLayerFilter?: string;
  timeOffset?: string;
  viewMode?: GlobeViewMode;
  onViewModeChange?: (mode: GlobeViewMode) => void;
  onStateSelect?: (state: IndiaStateRegion) => void;
  focusTarget?: FocusTargetCoords | null;
}

export const SpatialAtmosphericCanvas: React.FC<SpatialAtmosphericCanvasProps> = ({
  onSelectEvent,
  selectedEventId,
  activeLayerFilter = 'ALL',
  timeOffset = 'NOW',
  viewMode: controlledMode,
  onViewModeChange,
  onStateSelect,
  focusTarget,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // View mode (Internal / Controlled)
  const [internalMode, setInternalMode] = useState<GlobeViewMode>('RADAR');
  const viewMode = controlledMode || internalMode;
  const setMode = (m: GlobeViewMode) => {
    setInternalMode(m);
    if (onViewModeChange) onViewModeChange(m);
  };

  // 3D Orbital Camera Parameters
  // Centered on India (approx Lat 21°N, Lng 78°E: rotationY = -1.36, rotationX = 0.36)
  const [rotationY, setRotationY] = useState<number>(-1.36);
  const [rotationX, setRotationX] = useState<number>(0.36);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isFocusedIndia, setIsFocusedIndia] = useState<boolean>(false);

  // Hover and interaction states
  const [hoveredNode, setHoveredNode] = useState<SpatialEventNode | null>(null);
  const [hoveredState, setHoveredState] = useState<IndiaStateRegion | null>(null);
  const [selectedState, setSelectedState] = useState<IndiaStateRegion | null>(null);
  const [hoveredBeacon, setHoveredBeacon] = useState<MultiSourceBeacon | null>(null);

  // Drag interaction tracking
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastUserInteractionTimeRef = useRef<number>(Date.now());

  // Camera animation target for smooth transitions (Focus India / Reset / State select)
  const targetCamRef = useRef<{ rotY: number; rotX: number; zoom: number } | null>(null);

  // Smooth Focus India Action
  const focusOnIndia = useCallback(() => {
    setIsAutoRotating(false);
    setIsFocusedIndia(true);
    setSelectedState(null);
    lastUserInteractionTimeRef.current = Date.now();
    targetCamRef.current = {
      rotY: -1.36,
      rotX: 0.36,
      zoom: 1.35, // Smoothly zoom into India
    };
  }, []);

  // Smooth Reset Global View Action
  const resetView = useCallback(() => {
    setIsFocusedIndia(false);
    setSelectedState(null);
    lastUserInteractionTimeRef.current = Date.now();
    targetCamRef.current = {
      rotY: -1.35,
      rotX: 0.35,
      zoom: 0.95, // Global perspective
    };
  }, []);

  // Center on specific state
  const centerOnState = useCallback((st: IndiaStateRegion) => {
    setIsAutoRotating(false);
    setSelectedState(st);
    if (onStateSelect) onStateSelect(st);
    lastUserInteractionTimeRef.current = Date.now();
    targetCamRef.current = {
      rotY: -((st.centerLng * Math.PI) / 180),
      rotX: (st.centerLat * Math.PI) / 180,
      zoom: 1.45,
    };
  }, [onStateSelect]);

  // Center on specific event
  const centerOnEvent = useCallback((event: SpatialEventNode) => {
    setIsAutoRotating(false);
    lastUserInteractionTimeRef.current = Date.now();
    targetCamRef.current = {
      rotY: -((event.lng * Math.PI) / 180),
      rotX: (event.lat * Math.PI) / 180,
      zoom: 1.45,
    };
    onSelectEvent(event);
  }, [onSelectEvent]);

  // Handle external focus target (e.g. from Copilot or Location Focus)
  useEffect(() => {
    if (focusTarget && focusTarget.lat && focusTarget.lng) {
      setIsAutoRotating(false);
      lastUserInteractionTimeRef.current = Date.now();
      targetCamRef.current = {
        rotY: -((focusTarget.lng * Math.PI) / 180),
        rotX: (focusTarget.lat * Math.PI) / 180,
        zoom: focusTarget.zoom || 1.45,
      };
    }
  }, [focusTarget]);

  // Weather Flow Particles Stream simulation
  const particlesRef = useRef<
    Array<{ lat: number; lng: number; speed: number; angle: number; life: number; maxLife: number; type: 'WIND' | 'RAIN' | 'MOISTURE' }>
  >([]);

  useEffect(() => {
    // Generate initial weather flow particles around Bay of Bengal & Arabian Sea
    const arr = [];
    for (let i = 0; i < 90; i++) {
      const type = i % 3 === 0 ? 'RAIN' : i % 2 === 0 ? 'MOISTURE' : 'WIND';
      arr.push({
        lat: 6 + Math.random() * 24,
        lng: 65 + Math.random() * 32,
        speed: 0.06 + Math.random() * 0.12,
        angle: (Math.PI / 180) * (30 + Math.random() * 45), // North-East tracking monsoon
        life: Math.floor(Math.random() * 120),
        maxLife: 90 + Math.floor(Math.random() * 70),
        type,
      });
    }
    particlesRef.current = arr;
  }, []);

  // Main 3D Sphere Canvas Projection Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;

      // Smooth camera interpolation if target exists
      if (targetCamRef.current) {
        const { rotY, rotX, zoom: targetZoom } = targetCamRef.current;
        setRotationY((prev) => prev + (rotY - prev) * 0.08);
        setRotationX((prev) => prev + (rotX - prev) * 0.08);
        setZoom((prev) => prev + (targetZoom - prev) * 0.08);

        if (
          Math.abs(rotationY - rotY) < 0.005 &&
          Math.abs(rotationX - rotX) < 0.005 &&
          Math.abs(zoom - targetZoom) < 0.01
        ) {
          targetCamRef.current = null;
        }
      } else if (
        isAutoRotating &&
        !isDraggingRef.current &&
        !selectedState &&
        !selectedEventId &&
        Date.now() - lastUserInteractionTimeRef.current > 4000
      ) {
        // Slow gentle idle rotation
        setRotationY((prev) => prev + 0.0009);
      }

      // Handle high DPI scaling
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (
        canvas.width !== width * window.devicePixelRatio ||
        canvas.height !== height * window.devicePixelRatio
      ) {
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
      }
      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Deep space-like midnight navy backdrop
      ctx.fillStyle = '#020612';
      ctx.fillRect(0, 0, width, height);

      // Globe Geometry setup (placed toward center/right per requirement)
      const globeCenterX = width * 0.58;
      const globeCenterY = height * 0.5;
      const baseRadius = Math.min(width, height) * 0.36 * zoom;

      // 1. Draw Outer Atmospheric Glow Halo
      const atmoGrad = ctx.createRadialGradient(
        globeCenterX,
        globeCenterY,
        baseRadius * 0.88,
        globeCenterX,
        globeCenterY,
        baseRadius * 1.38
      );
      if (viewMode === 'THREAT' || activeLayerFilter === 'LAYER_05') {
        atmoGrad.addColorStop(0, 'rgba(239, 68, 68, 0.30)'); // Red glow in Threat mode
        atmoGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.16)');
      } else if (activeLayerFilter === 'LAYER_04') {
        atmoGrad.addColorStop(0, 'rgba(16, 185, 129, 0.28)'); // Emerald AI verification
        atmoGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.15)');
      } else {
        atmoGrad.addColorStop(0, 'rgba(6, 182, 212, 0.28)'); // Electric cyan
        atmoGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.16)'); // Aurora violet
      }
      atmoGrad.addColorStop(1, 'rgba(2, 6, 18, 0)');

      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, baseRadius * 1.38, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Globe Sphere Base
      const sphereGrad = ctx.createRadialGradient(
        globeCenterX - baseRadius * 0.35,
        globeCenterY - baseRadius * 0.35,
        baseRadius * 0.1,
        globeCenterX,
        globeCenterY,
        baseRadius
      );
      if (viewMode === 'SATELLITE') {
        sphereGrad.addColorStop(0, '#0c2242');
        sphereGrad.addColorStop(0.55, '#051226');
        sphereGrad.addColorStop(0.9, '#020714');
        sphereGrad.addColorStop(1, '#000207');
      } else {
        sphereGrad.addColorStop(0, '#0a1d3b');
        sphereGrad.addColorStop(0.55, '#040d1e');
        sphereGrad.addColorStop(0.9, '#020611');
        sphereGrad.addColorStop(1, '#00030a');
      }

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(globeCenterX, globeCenterY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Globe Rim Lighting
      ctx.strokeStyle =
        viewMode === 'THREAT' || activeLayerFilter === 'LAYER_05'
          ? 'rgba(244, 63, 94, 0.5)'
          : 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Spherical Projection Helper
      const project = (latDeg: number, lonDeg: number, altitude = 1.0) => {
        const latRad = (latDeg * Math.PI) / 180;
        const lonRad = (lonDeg * Math.PI) / 180;

        let x = Math.cos(latRad) * Math.sin(lonRad);
        let y = -Math.sin(latRad);
        let z = Math.cos(latRad) * Math.cos(lonRad);

        // Rotate Y axis
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotate X axis
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const isVisible = z2 > -0.15;
        const screenX = globeCenterX + x1 * baseRadius * altitude;
        const screenY = globeCenterY + y2 * baseRadius * altitude;

        return { x: screenX, y: screenY, z: z2, isVisible };
      };

      // 4. Draw Graticule Coordinate Grid
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';

      // Latitude Parallels
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 6) {
          const p = project(lat, lon, 1.0);
          if (p.isVisible) {
            if (first) {
              ctx.moveTo(p.x, p.y);
              first = false;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Longitude Meridians
      for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -80; lat <= 80; lat += 5) {
          const p = project(lat, lon, 1.0);
          if (p.isVisible) {
            if (first) {
              ctx.moveTo(p.x, p.y);
              first = false;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // 5. LAYER 01 SPECIFIC: ISOBAR CURVES & SURFACE AWS READINGS
      if (activeLayerFilter === 'LAYER_01' || activeLayerFilter === 'ALL') {
        const isobars = [
          { lat: 10, pressure: '1008 hPa' },
          { lat: 18, pressure: '1010 hPa' },
          { lat: 26, pressure: '1012 hPa' },
        ];
        ctx.lineWidth = 0.8;
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.font = '500 8.5px monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';

        for (const iso of isobars) {
          ctx.beginPath();
          let f = true;
          for (let lon = 65; lon <= 95; lon += 3) {
            const p = project(iso.lat + Math.sin(lon * 0.15) * 1.5, lon, 1.008);
            if (p.isVisible) {
              if (f) {
                ctx.moveTo(p.x, p.y);
                f = false;
              } else {
                ctx.lineTo(p.x, p.y);
              }
            }
          }
          ctx.stroke();

          // Label
          const tagP = project(iso.lat, 88, 1.01);
          if (tagP.isVisible && zoom > 0.9) {
            ctx.fillText(iso.pressure, tagP.x, tagP.y - 3);
          }
        }
        ctx.setLineDash([]);
      }

      // 6. Draw India States & Regions (State boundaries exploration)
      for (const st of INDIA_STATE_REGIONS) {
        const isHoveredState = hoveredState?.id === st.id;
        const isSelectedState = selectedState?.id === st.id;

        ctx.beginPath();
        let stFirst = true;
        for (const [lat, lon] of st.polygon) {
          const pt = project(lat, lon, 1.002);
          if (pt.isVisible) {
            if (stFirst) {
              ctx.moveTo(pt.x, pt.y);
              stFirst = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        }
        ctx.closePath();

        // Highlighting hovered/selected state
        if (isHoveredState || isSelectedState) {
          ctx.fillStyle = isSelectedState
            ? 'rgba(6, 182, 212, 0.45)'
            : 'rgba(6, 182, 212, 0.22)';
          ctx.fill();
          ctx.strokeStyle = '#22D3EE';
          ctx.lineWidth = 2.0;
          ctx.stroke();
        } else {
          ctx.fillStyle =
            (viewMode === 'THREAT' || activeLayerFilter === 'LAYER_05') && st.highRisk > 0
              ? 'rgba(239, 68, 68, 0.20)'
              : 'rgba(14, 116, 144, 0.12)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // State Short Label on Map when zoomed in or focused
        if (zoom > 1.15) {
          const centerPt = project(st.centerLat, st.centerLng, 1.004);
          if (centerPt.isVisible) {
            ctx.font = '700 9px monospace';
            ctx.fillStyle = isHoveredState || isSelectedState ? '#FFFFFF' : 'rgba(148, 163, 184, 0.7)';
            ctx.fillText(st.shortName, centerPt.x - 7, centerPt.y);
          }
        }
      }

      // 7. Draw Full India Outer Shoreline
      const indiaPolygon = [
        [35.0, 77.0], [33.0, 75.0], [31.5, 74.0], [28.0, 70.0], [24.0, 68.5],
        [22.5, 69.5], [21.0, 72.5], [19.0, 72.8], [15.0, 73.8], [11.0, 75.8],
        [8.1, 77.5], [9.5, 79.2], [13.1, 80.3], [16.0, 81.5], [18.0, 83.5],
        [20.5, 86.8], [22.0, 89.0], [22.5, 91.5], [24.0, 92.5], [26.5, 93.5],
        [28.0, 96.5], [28.5, 89.0], [27.0, 85.0], [29.5, 80.0], [32.0, 78.5], [35.0, 77.0],
      ];

      ctx.beginPath();
      let indiaFirst = true;
      for (const [lat, lon] of indiaPolygon) {
        const pt = project(lat, lon, 1.001);
        if (pt.isVisible) {
          if (indiaFirst) {
            ctx.moveTo(pt.x, pt.y);
            indiaFirst = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      }
      ctx.closePath();
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 8. ANIMATED WEATHER FLOWS (Wind, Rain, and Moisture Vectors)
      ctx.lineWidth = 1.0;
      for (const p of particlesRef.current) {
        p.lat += Math.sin(p.angle) * p.speed;
        p.lng += Math.cos(p.angle) * p.speed;
        p.life++;

        if (p.life > p.maxLife || p.lat > 33 || p.lng > 96) {
          p.lat = 6 + Math.random() * 12;
          p.lng = 68 + Math.random() * 20;
          p.life = 0;
        }

        const pt1 = project(p.lat, p.lng, 1.02);
        const pt2 = project(
          p.lat + (p.type === 'RAIN' ? -0.2 : 0.25),
          p.lng + 0.25,
          1.02
        );

        if (pt1.isVisible && pt2.isVisible) {
          const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.7;
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);

          if (p.type === 'RAIN') {
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1.2;
          } else if (p.type === 'MOISTURE') {
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.8})`;
            ctx.lineWidth = 0.9;
          } else {
            ctx.strokeStyle =
              viewMode === 'THREAT' || activeLayerFilter === 'LAYER_05'
                ? `rgba(239, 68, 68, ${alpha})`
                : `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 1.0;
          }
          ctx.stroke();
        }
      }

      // Thunderstorm micro-flashes at active thunderstorm coordinates
      if (tick % 70 < 4) {
        const stormPt = project(13.08, 80.27, 1.04);
        if (stormPt.isVisible) {
          ctx.beginPath();
          ctx.arc(stormPt.x, stormPt.y, 25 * zoom, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.fill();
        }
      }
      if ((tick + 35) % 85 < 4) {
        const stormPt2 = project(21.49, 86.91, 1.04);
        if (stormPt2.isVisible) {
          ctx.beginPath();
          ctx.arc(stormPt2.x, stormPt2.y, 20 * zoom, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(168, 85, 247, 0.22)';
          ctx.fill();
        }
      }

      // 9. DOPPLER RADAR SWEEP (Chennai & Mumbai)
      if (viewMode === 'RADAR' || activeLayerFilter === 'LAYER_01') {
        const radarStations = [
          { lat: 13.08, lng: 80.27, radius: 95 * zoom, color: 'rgba(6, 182, 212,' },
          { lat: 19.07, lng: 72.87, radius: 75 * zoom, color: 'rgba(56, 189, 248,' },
        ];

        for (const st of radarStations) {
          const rCenter = project(st.lat, st.lng, 1.02);
          if (rCenter.isVisible) {
            ctx.save();
            ctx.translate(rCenter.x, rCenter.y);
            ctx.rotate((tick * 0.035) % (Math.PI * 2));

            // Sector gradient
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, st.radius, 0, Math.PI / 4);
            ctx.closePath();
            const sweepGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, st.radius);
            sweepGrad.addColorStop(0, `${st.color} 0.45)`);
            sweepGrad.addColorStop(1, `${st.color} 0)`);
            ctx.fillStyle = sweepGrad;
            ctx.fill();

            // Range rings
            ctx.beginPath();
            ctx.arc(0, 0, st.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `${st.color} 0.35)`;
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }
        }
      }

      // 10. LAYER 02 SPECIFIC: MULTI-SOURCE INGESTION BEACONS
      if (activeLayerFilter === 'LAYER_02') {
        for (const b of MULTI_SOURCE_BEACONS) {
          const pt = project(b.lat, b.lng, 1.05);
          if (!pt.isVisible) continue;

          // Tiny pulsing beacon
          const isHovered = hoveredBeacon?.id === b.id;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isHovered ? 5.5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Outer pulse
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 7 + (tick % 25) * 0.3, 0, Math.PI * 2);
          ctx.strokeStyle = `${b.color}66`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Label tag when hovered or zoomed
          if (isHovered || zoom > 1.25) {
            ctx.font = '600 8.5px monospace';
            ctx.fillStyle = '#E2E8F0';
            ctx.fillText(b.sourceType, pt.x + 8, pt.y + 3);
          }
        }
      }

      // 11. LAYER 03 SPECIFIC: CORRELATION ARCS & CLUSTERS
      if (activeLayerFilter === 'LAYER_03' || activeLayerFilter === 'ALL') {
        const correlationPairs = [
          { fromLat: 13.08, fromLng: 80.27, toLat: 12.98, toLng: 80.17, score: 94, color: '#06B6D4' },
          { fromLat: 13.08, fromLng: 80.27, toLat: 12.97, toLng: 77.59, score: 85, color: '#A855F7' },
          { fromLat: 19.07, fromLng: 72.87, toLat: 18.90, toLng: 72.82, score: 89, color: '#38BDF8' },
          { fromLat: 26.14, fromLng: 91.73, toLat: 26.18, toLng: 91.75, score: 91, color: '#60A5FA' },
        ];

        for (const pair of correlationPairs) {
          const p1 = project(pair.fromLat, pair.fromLng, 1.06);
          const p2 = project(pair.toLat, pair.toLng, 1.06);

          if (p1.isVisible && p2.isVisible) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            const midX = (p1.x + p2.x) / 2 + 10;
            const midY = (p1.y + p2.y) / 2 - 15;
            ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
            ctx.strokeStyle = pair.color;
            ctx.lineWidth = activeLayerFilter === 'LAYER_03' ? 2.2 : 1.2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Moving packet along the curve
            const tParam = (tick * 0.02) % 1;
            const curX = (1 - tParam) * (1 - tParam) * p1.x + 2 * (1 - tParam) * tParam * midX + tParam * tParam * p2.x;
            const curY = (1 - tParam) * (1 - tParam) * p1.y + 2 * (1 - tParam) * tParam * midY + tParam * tParam * p2.y;
            ctx.beginPath();
            ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
          }
        }
      }

      // 12. LAYER 05 SPECIFIC: THREAT POLYGONS & DANGER RINGS
      if (viewMode === 'THREAT' || activeLayerFilter === 'LAYER_05') {
        const threatZones = [
          { lat: 13.08, lng: 80.27, radius: 50 * zoom, label: 'SEVERE FLASH FLOOD DANGER' },
          { lat: 26.14, lng: 91.73, radius: 40 * zoom, label: 'BRAHMAPUTRA SURGE ZONE' },
        ];

        for (const tz of threatZones) {
          const pt = project(tz.lat, tz.lng, 1.03);
          if (pt.isVisible) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, tz.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
            ctx.fill();
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 1.6;
            ctx.stroke();

            // Threat Label Tag
            ctx.font = '700 8.5px monospace';
            ctx.fillStyle = '#FCA5A5';
            ctx.fillText(`⚠ ${tz.label}`, pt.x - 30, pt.y - tz.radius - 4);
          }
        }
      }

      // 13. RENDER 3D WEATHER EVENT MARKERS WITH RADAR RINGS
      for (const node of SPATIAL_EVENT_NODES) {
        const pt = project(node.lat, node.lng, 1.06);
        if (!pt.isVisible) continue;

        const isSelected = selectedEventId === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const scale = isSelected || isHovered ? 1.3 : 1.0;

        // Concentric Radar Ring around Active Event
        const radarRingSize = 10 + (tick % 40) * 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radarRingSize, 0, Math.PI * 2);
        ctx.strokeStyle = `${node.severityColor}55`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulsing Core Beacon
        const pulseSize = 7 + Math.sin(tick * 0.08 + node.lat) * 2.2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pulseSize * scale, 0, Math.PI * 2);
        ctx.fillStyle = `${node.severityColor}33`;
        ctx.fill();

        // Core Pin
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = node.severityColor;
        ctx.shadowColor = node.severityColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // LAYER 04 SPECIFIC: AI VERIFICATION BADGE HALO
        if (activeLayerFilter === 'LAYER_04') {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 16 * scale, 0, Math.PI * 2);
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Floating Event Label Tag
        const labelX = pt.x + 12;
        const labelY = pt.y - 10;

        ctx.fillStyle = 'rgba(2, 6, 23, 0.90)';
        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = isSelected ? 1.5 : 0.8;

        const tagText = `${node.city} • ${node.confidence}%`;
        const textWidth = ctx.measureText(tagText).width;

        ctx.beginPath();
        ctx.roundRect(labelX, labelY - 12, textWidth + 14, 18, 4);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(labelX + 6, labelY - 3, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.severityColor;
        ctx.fill();

        ctx.font = '600 10px monospace';
        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(tagText, labelX + 12, labelY);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    rotationX,
    rotationY,
    zoom,
    isAutoRotating,
    viewMode,
    activeLayerFilter,
    selectedEventId,
    hoveredNode,
    hoveredState,
    hoveredBeacon,
    selectedState,
  ]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    setIsAutoRotating(false);
    lastUserInteractionTimeRef.current = Date.now();
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (!isDraggingRef.current) {
      // 1. Check Event Hit
      let foundEvent: SpatialEventNode | null = null;
      for (const node of SPATIAL_EVENT_NODES) {
        const latRad = (node.lat * Math.PI) / 180;
        const lonRad = (node.lng * Math.PI) / 180;
        let x = Math.cos(latRad) * Math.sin(lonRad);
        let y = -Math.sin(latRad);
        let z = Math.cos(latRad) * Math.cos(lonRad);

        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        if (z2 > 0) {
          const globeCenterX = canvasRef.current.clientWidth * 0.58;
          const globeCenterY = canvasRef.current.clientHeight * 0.5;
          const baseRadius =
            Math.min(canvasRef.current.clientWidth, canvasRef.current.clientHeight) * 0.36 * zoom;

          const screenX = globeCenterX + x1 * baseRadius * 1.06;
          const screenY = globeCenterY + y2 * baseRadius * 1.06;

          if (Math.hypot(mouseX - screenX, mouseY - screenY) < 22) {
            foundEvent = node;
            break;
          }
        }
      }
      setHoveredNode(foundEvent);

      // 2. Check State Hit if not hovering an event
      if (!foundEvent) {
        let foundState: IndiaStateRegion | null = null;
        for (const st of INDIA_STATE_REGIONS) {
          const latRad = (st.centerLat * Math.PI) / 180;
          const lonRad = (st.centerLng * Math.PI) / 180;
          let x = Math.cos(latRad) * Math.sin(lonRad);
          let y = -Math.sin(latRad);
          let z = Math.cos(latRad) * Math.cos(lonRad);

          const cosY = Math.cos(rotationY);
          const sinY = Math.sin(rotationY);
          const x1 = x * cosY - z * sinY;
          const z1 = x * sinY + z * cosY;

          const cosX = Math.cos(rotationX);
          const sinX = Math.sin(rotationX);
          const y2 = y * cosX - z1 * sinX;
          const z2 = y * sinX + z1 * cosX;

          if (z2 > 0) {
            const globeCenterX = canvasRef.current.clientWidth * 0.58;
            const globeCenterY = canvasRef.current.clientHeight * 0.5;
            const baseRadius =
              Math.min(canvasRef.current.clientWidth, canvasRef.current.clientHeight) * 0.36 * zoom;

            const screenX = globeCenterX + x1 * baseRadius * 1.002;
            const screenY = globeCenterY + y2 * baseRadius * 1.002;

            if (Math.hypot(mouseX - screenX, mouseY - screenY) < 30) {
              foundState = st;
              break;
            }
          }
        }
        setHoveredState(foundState);
      } else {
        setHoveredState(null);
      }
    }

    if (isDraggingRef.current) {
      lastUserInteractionTimeRef.current = Date.now();
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setRotationY((prev) => prev + deltaX * 0.006);
      setRotationX((prev) => Math.max(-1.1, Math.min(1.1, prev - deltaY * 0.006)));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    lastUserInteractionTimeRef.current = Date.now();
    if (hoveredNode) {
      centerOnEvent(hoveredNode);
    } else if (hoveredState) {
      centerOnState(hoveredState);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    lastUserInteractionTimeRef.current = Date.now();
    setZoom((z) => Math.max(0.7, Math.min(1.8, z - e.deltaY * 0.001)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[560px] sm:h-[640px] lg:h-[720px] overflow-hidden select-none"
    >
      {/* 3D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Floating 4-Mode Toggle (RADAR | SATELLITE | EVENTS | THREAT) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-4 z-20 flex items-center p-1 rounded-xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md shadow-2xl text-[10.5px] font-mono font-bold tracking-wider">
        <button
          type="button"
          onClick={() => setMode('RADAR')}
          className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
            viewMode === 'RADAR'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>RADAR</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('SATELLITE')}
          className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
            viewMode === 'SATELLITE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>SATELLITE</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('EVENTS')}
          className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
            viewMode === 'EVENTS'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>EVENTS</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('THREAT')}
          className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
            viewMode === 'THREAT'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>THREAT</span>
        </button>
      </div>

      {/* Floating Focus India & Reset Controls */}
      <div className="absolute top-16 right-4 z-20 flex flex-col gap-1.5 p-1 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-xl text-xs text-slate-300">
        <button
          type="button"
          onClick={focusOnIndia}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase transition-colors cursor-pointer ${
            isFocusedIndia
              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
              : 'hover:bg-cyan-950/80 text-cyan-400 hover:text-white'
          }`}
          title="Zoom directly into India Meteorological Subcontinent"
        >
          <Navigation className="w-3.5 h-3.5 rotate-45" />
          <span>Focus India</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsAutoRotating(false);
            lastUserInteractionTimeRef.current = Date.now();
            targetCamRef.current = {
              rotY: -((80.2707 * Math.PI) / 180),
              rotX: (13.0827 * Math.PI) / 180,
              zoom: 1.45,
            };
          }}
          className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase transition-colors cursor-pointer bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30"
          title="Focus 3D Earth on your GPS location (Chennai, Tamil Nadu)"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Focus on Me</span>
        </button>

        <button
          type="button"
          onClick={resetView}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
          title="Return to Global Orbital View"
        >
          Reset View
        </button>

        <div className="h-[1px] bg-slate-800 mx-1 my-0.5" />

        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1 rounded transition-colors ${
              isAutoRotating ? 'text-cyan-400' : 'text-slate-500'
            }`}
            title="Toggle Idle Orbit"
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* State Hover HUD Tooltip */}
      {hoveredState && !hoveredNode && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 p-2.5 rounded-xl bg-slate-950/95 border border-cyan-500/50 backdrop-blur-md shadow-2xl text-xs text-white animate-in fade-in duration-150 pointer-events-none flex items-center gap-3">
          <div>
            <div className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wider">
              {hoveredState.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Dominant: <strong className="text-white">{hoveredState.dominantEvent}</strong>
            </div>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2.5 font-mono text-[10.5px]">
            <div>
              <span className="text-slate-400">Events: </span>
              <span className="font-bold text-white">{hoveredState.activeEvents}</span>
            </div>
            <div>
              <span className="text-slate-400">Verified: </span>
              <span className="font-bold text-emerald-400">{hoveredState.verified}</span>
            </div>
            <div>
              <span className="text-slate-400">Confidence: </span>
              <span className="font-bold text-cyan-300">{hoveredState.avgConfidence}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Event Hover Rich Intelligence Tooltip */}
      {hoveredNode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 p-3 rounded-2xl bg-slate-950/95 border border-cyan-400/60 backdrop-blur-md shadow-2xl text-xs text-white animate-in fade-in duration-150 pointer-events-none max-w-sm">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span
              className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: hoveredNode.severityColor }}
            >
              {hoveredNode.category}
            </span>
            <span className="text-[10px] font-mono text-slate-400">{hoveredNode.timestamp}</span>
          </div>
          <h4 className="font-bold text-sm text-white">{hoveredNode.title}</h4>
          <p className="text-[11px] font-mono text-cyan-300">{hoveredNode.city}, {hoveredNode.state}</p>
          <p className="text-[10.5px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {hoveredNode.details}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10.5px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{hoveredNode.confidence}% CONFIDENCE</span>
            </div>
            <span className="text-slate-400">
              {hoveredNode.sourcesCount} CORRELATED SOURCES
            </span>
          </div>
          <div className="mt-1 text-[9.5px] font-mono text-cyan-400 text-right">
            Click marker to open full dossier →
          </div>
        </div>
      )}

      {/* Quick State Selection Bar at Bottom Center of Globe */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md text-[10px] font-mono">
        <span className="text-slate-400 font-bold px-1.5">STATE JUMP:</span>
        {INDIA_STATE_REGIONS.slice(0, 6).map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => centerOnState(st)}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              selectedState?.id === st.id
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st.shortName}
          </button>
        ))}
      </div>

      {/* Bottom Telemetry HUD Bar */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:block">
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md text-[10.5px] font-mono text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>MODE: {viewMode}</span>
          </span>
          <span>•</span>
          <span>LAYER: {activeLayerFilter}</span>
          <span>•</span>
          <span className="text-slate-200">ZOOM: {Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
