import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  Radio,
  Layers,
  Sparkles,
  CloudRain,
  Flame,
  Zap,
  Globe,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  MapWeatherEvent,
  REALTIME_WEATHER_EVENTS,
  WEATHER_ZONES,
  MapWeatherZone,
} from './osData.ts';
import { INDIA_STATE_REGIONS, IndiaStateRegion } from '../spatial/stateGeometries.ts';

export type OSMapMode = 'WEATHER' | 'RADAR' | 'SATELLITE' | 'EVENTS' | 'THREAT';

interface IndiaWeatherIntelligenceMapProps {
  selectedEvent: MapWeatherEvent | null;
  onSelectEvent: (event: MapWeatherEvent) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  focusCoords?: { lat: number; lng: number; zoom?: number } | null;
  activeFilter?: string;
  activeMode?: OSMapMode;
  onModeChange?: (mode: OSMapMode) => void;
}

export const IndiaWeatherIntelligenceMap: React.FC<IndiaWeatherIntelligenceMapProps> = ({
  selectedEvent,
  onSelectEvent,
  userCoords,
  focusCoords,
  activeFilter,
  activeMode: controlledMode,
  onModeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mode, setModeState] = useState<OSMapMode>('WEATHER');
  const activeMode = controlledMode || mode;
  const setMode = (m: OSMapMode) => {
    setModeState(m);
    if (onModeChange) onModeChange(m);
  };

  // Geospatial Viewport: Center on India (Lat: ~21.5°N, Lng: ~82.0°E)
  const [centerLat, setCenterLat] = useState<number>(21.5);
  const [centerLng, setCenterLng] = useState<number>(82.0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Target coordinates for smooth panning / camera lerp
  const targetCameraRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null);

  // Hover and interaction states
  const [hoveredEvent, setHoveredEvent] = useState<MapWeatherEvent | null>(null);
  const [hoveredState, setHoveredState] = useState<IndiaStateRegion | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Smoothly center on focusCoords when provided (from AI Copilot or selection)
  useEffect(() => {
    if (focusCoords) {
      targetCameraRef.current = {
        lat: focusCoords.lat,
        lng: focusCoords.lng,
        zoom: focusCoords.zoom || 1.35,
      };
    }
  }, [focusCoords]);

  // Center on user GPS coordinates
  const centerOnUser = useCallback(() => {
    if (userCoords) {
      targetCameraRef.current = {
        lat: userCoords.latitude,
        lng: userCoords.longitude,
        zoom: 1.45,
      };
    } else {
      // Default to Chennai evaluation baseline if user coordinates not provided
      targetCameraRef.current = {
        lat: 13.0827,
        lng: 80.2707,
        zoom: 1.45,
      };
    }
  }, [userCoords]);

  // Reset to full India view
  const focusIndiaFull = useCallback(() => {
    targetCameraRef.current = {
      lat: 21.5,
      lng: 82.0,
      zoom: 1.0,
    };
  }, []);

  // Animated flow particles across India (Rainfall & Wind streamlines)
  const flowParticlesRef = useRef<
    Array<{ lat: number; lng: number; speed: number; angle: number; life: number; maxLife: number }>
  >([]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 90; i++) {
      arr.push({
        lat: 8 + Math.random() * 22,
        lng: 68 + Math.random() * 25,
        speed: 0.06 + Math.random() * 0.08,
        angle: (Math.PI / 180) * (35 + Math.random() * 30), // North-East tracking monsoon
        life: Math.floor(Math.random() * 100),
        maxLife: 80 + Math.floor(Math.random() * 60),
      });
    }
    flowParticlesRef.current = arr;
  }, []);

  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick++;

      // Smooth camera interpolation (Lerp)
      if (targetCameraRef.current) {
        const { lat, lng, zoom } = targetCameraRef.current;
        setCenterLat((prev) => prev + (lat - prev) * 0.1);
        setCenterLng((prev) => prev + (lng - prev) * 0.1);
        setZoomLevel((prev) => prev + (zoom - prev) * 0.1);

        if (
          Math.abs(centerLat - lat) < 0.02 &&
          Math.abs(centerLng - lng) < 0.02 &&
          Math.abs(zoomLevel - zoom) < 0.01
        ) {
          targetCameraRef.current = null;
        }
      }

      // High DPI resize check
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

      // Deep charcoal / midnight blue background per design language
      ctx.fillStyle = '#050D1A';
      ctx.fillRect(0, 0, width, height);

      // Coordinate Projector (Equirectangular / Mercator Hybrid scaled to center of India)
      // Base bounding box: Lat 5°N to 38°N (~33 deg), Lng 67°E to 98°E (~31 deg)
      const project = (lat: number, lng: number) => {
        const scale = (Math.min(width, height) / 33) * zoomLevel * 1.05;
        const x = width * 0.5 + (lng - centerLng) * scale * 1.05;
        const y = height * 0.5 - (lat - centerLat) * scale;
        return { x, y };
      };

      // 1. Draw Geographic Coordinate Grid & Range Rings
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';

      for (let lat = 8; lat <= 36; lat += 4) {
        const p1 = project(lat, 66);
        const p2 = project(lat, 98);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fillText(`${lat}°N`, 12, p1.y + 3);
      }

      for (let lng = 68; lng <= 96; lng += 4) {
        const p1 = project(6, lng);
        const p2 = project(38, lng);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fillText(`${lng}°E`, p1.x - 10, height - 10);
      }

      // 2. Maritime Water Bodies Labels
      const pArabian = project(15.0, 70.0);
      const pBay = project(14.0, 89.0);
      ctx.font = '700 11px monospace';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.letterSpacing = '4px';
      ctx.fillText('ARABIAN SEA', pArabian.x - 40, pArabian.y);
      ctx.fillText('BAY OF BENGAL', pBay.x - 40, pBay.y);
      ctx.letterSpacing = '0px';

      // 3. Draw India States & Administrative Boundaries
      for (const st of INDIA_STATE_REGIONS) {
        const isHoveredState = hoveredState?.id === st.id;
        ctx.beginPath();
        let first = true;
        for (const [lat, lon] of st.polygon) {
          const pt = project(lat, lon);
          if (first) {
            ctx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.closePath();

        // Fill state with subtle atmospheric tint
        if (isHoveredState) {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
          ctx.fill();
          ctx.strokeStyle = '#22D3EE';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        } else {
          ctx.fillStyle =
            activeMode === 'THREAT' && st.highRisk > 0
              ? 'rgba(239, 68, 68, 0.12)'
              : 'rgba(10, 24, 46, 0.65)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // State Name Label
        if (zoomLevel >= 1.05) {
          const centerPt = project(st.centerLat, st.centerLng);
          ctx.font = '600 9.5px monospace';
          ctx.fillStyle = isHoveredState ? '#FFFFFF' : 'rgba(148, 163, 184, 0.65)';
          ctx.fillText(st.name.toUpperCase(), centerPt.x - 20, centerPt.y);
        }
      }

      // 4. Draw Full India Coastline Contour with Subtle Glow
      const indiaPolygon = [
        [35.0, 77.0], [33.0, 75.0], [31.5, 74.0], [28.0, 70.0], [24.0, 68.5],
        [22.5, 69.5], [21.0, 72.5], [19.0, 72.8], [15.0, 73.8], [11.0, 75.8],
        [8.1, 77.5],  // Kanyakumari
        [9.5, 79.2],  // Rameshwaram
        [13.1, 80.3], // Chennai
        [16.0, 81.5], [18.0, 83.5], [20.5, 86.8], [22.0, 89.0], // Bay of Bengal Coast
        [22.5, 91.5], [24.0, 92.5], [26.5, 93.5], [28.0, 96.5], // Assam / North-East
        [28.5, 89.0], [27.0, 85.0], [29.5, 80.0], [32.0, 78.5], [35.0, 77.0]
      ];

      ctx.beginPath();
      let first = true;
      for (const [lat, lon] of indiaPolygon) {
        const pt = project(lat, lon);
        if (first) {
          ctx.moveTo(pt.x, pt.y);
          first = false;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Sri Lanka Outline
      const sriLanka = [[9.0, 80.0], [7.0, 81.5], [6.0, 80.5], [8.0, 79.8]];
      ctx.beginPath();
      let slFirst = true;
      for (const [lat, lon] of sriLanka) {
        const pt = project(lat, lon);
        if (slFirst) { ctx.moveTo(pt.x, pt.y); slFirst = false; }
        else { ctx.lineTo(pt.x, pt.y); }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(10, 24, 46, 0.65)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 5. DYNAMIC WEATHER FIELDS
      // 5A. Flowing Rainfall Blue/Cyan Fields
      for (const zone of WEATHER_ZONES) {
        const p = project(zone.centerLat, zone.centerLng);
        const radiusPx = zone.radiusKm * (Math.min(width, height) / 3300) * zoomLevel * 10;

        if (zone.type === 'RAIN' && (activeMode === 'WEATHER' || activeMode === 'RADAR')) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radiusPx);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
          grad.addColorStop(0.6, 'rgba(14, 116, 144, 0.25)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radiusPx, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5B. Heatwave Orange/Red Thermal Zones
        if (zone.type === 'HEAT' && (activeMode === 'WEATHER' || activeMode === 'THREAT')) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radiusPx);
          grad.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
          grad.addColorStop(0.6, 'rgba(234, 88, 12, 0.22)');
          grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radiusPx, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5C. Thunderstorm Pulsing Violet/White Cells
        if (zone.type === 'STORM' && (activeMode === 'WEATHER' || activeMode === 'RADAR' || activeMode === 'EVENTS')) {
          const pulse = Math.sin(tick * 0.08) * 6;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radiusPx + pulse);
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.55)');
          grad.addColorStop(0.7, 'rgba(139, 92, 246, 0.20)');
          grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radiusPx + pulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5D. Flood-Risk Expanding Blue Wave Zones
        if (zone.type === 'FLOOD' && (activeMode === 'WEATHER' || activeMode === 'THREAT')) {
          const waveRadius = (tick * 0.6) % radiusPx;
          ctx.beginPath();
          ctx.arc(p.x, p.y, waveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(59, 130, 246, ${1 - waveRadius / radiusPx})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(p.x, p.y, radiusPx, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
          ctx.fill();
        }

        // 5E. Severe Event Red Pulsing Perimeter (Adyar Basin / Chennai)
        if (zone.type === 'SEVERE') {
          const pulseSize = radiusPx + Math.sin(tick * 0.1) * 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fill();
        }
      }

      // 6. ANIMATED WEATHER FLOW PARTICLES (Wind direction & precipitation movement)
      ctx.lineWidth = 1.0;
      for (const p of flowParticlesRef.current) {
        p.lat += Math.sin(p.angle) * p.speed;
        p.lng += Math.cos(p.angle) * p.speed;
        p.life++;

        if (p.life > p.maxLife || p.lat > 32 || p.lng > 96) {
          p.lat = 8 + Math.random() * 12;
          p.lng = 68 + Math.random() * 20;
          p.life = 0;
        }

        const pt1 = project(p.lat, p.lng);
        const pt2 = project(p.lat + 0.25, p.lng + 0.25);
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.65;

        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.strokeStyle =
          activeMode === 'THREAT'
            ? `rgba(239, 68, 68, ${alpha})`
            : `rgba(6, 182, 212, ${alpha})`;
        ctx.stroke();
      }

      // 7. RADAR SWEEP BEAM (When in RADAR mode)
      if (activeMode === 'RADAR') {
        const radarCenter = project(13.08, 80.27); // Chennai Doppler AWS
        const sweepRadius = 130 * zoomLevel;
        ctx.save();
        ctx.translate(radarCenter.x, radarCenter.y);
        ctx.rotate((tick * 0.035) % (Math.PI * 2));

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, sweepRadius, 0, Math.PI / 4);
        ctx.closePath();
        const sweepGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, sweepRadius);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
        sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = sweepGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, sweepRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 8. SATELLITE CLOUD SWIRLS (When in SATELLITE mode)
      if (activeMode === 'SATELLITE') {
        const satCenter = project(14.5, 84.5);
        ctx.save();
        ctx.translate(satCenter.x, satCenter.y);
        ctx.rotate((tick * 0.015) % (Math.PI * 2));
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, 40 * zoomLevel + i * 16, i * 1.5, i * 1.5 + 2.5);
          ctx.strokeStyle = `rgba(248, 250, 252, ${0.4 - i * 0.08})`;
          ctx.lineWidth = 4 - i * 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 9. CROSS-SOURCE CORRELATION ARCS
      const pChennai = project(13.08, 80.27);
      const pMeenambakkam = project(12.98, 80.17);
      const pBengaluru = project(12.97, 77.59);
      const pMumbai = project(19.07, 72.87);

      ctx.beginPath();
      ctx.moveTo(pChennai.x, pChennai.y);
      ctx.lineTo(pMeenambakkam.x, pMeenambakkam.y);
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(pChennai.x, pChennai.y);
      const midX = (pChennai.x + pBengaluru.x) / 2 + 15;
      const midY = (pChennai.y + pBengaluru.y) / 2 - 20;
      ctx.quadraticCurveTo(midX, midY, pBengaluru.x, pBengaluru.y);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 10. USER LOCATION GLOWING PIN
      if (userCoords) {
        const uPos = project(userCoords.latitude, userCoords.longitude);
        const pulse = 10 + Math.sin(tick * 0.1) * 4;
        ctx.beginPath();
        ctx.arc(uPos.x, uPos.y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(uPos.x, uPos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '700 9px monospace';
        ctx.fillStyle = '#10B981';
        ctx.fillText('YOU', uPos.x + 8, uPos.y + 3);
      }

      // 11. DYNAMIC WEATHER EVENT MARKERS
      for (const evt of REALTIME_WEATHER_EVENTS) {
        const pt = project(evt.lat, evt.lng);
        const isSelected = selectedEvent?.id === evt.id;
        const isHovered = hoveredEvent?.id === evt.id;
        const scale = isSelected || isHovered ? 1.3 : 1.0;

        // Concentric radar ring
        const ringRadius = 11 + (tick % 35) * 0.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${evt.color}55`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulsing core halo
        const haloSize = 7 + Math.sin(tick * 0.08 + evt.lat) * 2.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, haloSize * scale, 0, Math.PI * 2);
        ctx.fillStyle = `${evt.color}33`;
        ctx.fill();

        // Core Pin
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = evt.color;
        ctx.shadowColor = evt.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = isSelected ? 2 : 1.2;
        ctx.stroke();

        // Marker City HUD Tag
        const tagX = pt.x + 12;
        const tagY = pt.y - 8;
        const tagText = `${evt.city} • ${evt.confidence}%`;

        ctx.font = '600 9.5px monospace';
        const txtWidth = ctx.measureText(tagText).width;

        ctx.fillStyle = 'rgba(3, 9, 23, 0.88)';
        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = isSelected ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY - 10, txtWidth + 14, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(tagX + 6, tagY - 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = evt.color;
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(tagText, tagX + 12, tagY + 1);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    centerLat,
    centerLng,
    zoomLevel,
    activeMode,
    selectedEvent,
    hoveredEvent,
    hoveredState,
    userCoords,
  ]);

  // Mouse & Touch Drag Interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (!isDraggingRef.current) {
      // Hit-test on weather events
      let foundEvt: MapWeatherEvent | null = null;
      for (const evt of REALTIME_WEATHER_EVENTS) {
        const scale = (Math.min(canvasRef.current.clientWidth, canvasRef.current.clientHeight) / 33) * zoomLevel * 1.05;
        const ptX = canvasRef.current.clientWidth * 0.5 + (evt.lng - centerLng) * scale * 1.05;
        const ptY = canvasRef.current.clientHeight * 0.5 - (evt.lat - centerLat) * scale;

        if (Math.hypot(mouseX - ptX, mouseY - ptY) < 22) {
          foundEvt = evt;
          break;
        }
      }

      setHoveredEvent(foundEvt);
      if (foundEvt) {
        setTooltipPos({ x: mouseX, y: mouseY });
        setHoveredState(null);
      } else {
        setTooltipPos(null);

        // Hit-test on state regions
        let foundState: IndiaStateRegion | null = null;
        for (const st of INDIA_STATE_REGIONS) {
          const scale = (Math.min(canvasRef.current.clientWidth, canvasRef.current.clientHeight) / 33) * zoomLevel * 1.05;
          const ptX = canvasRef.current.clientWidth * 0.5 + (st.centerLng - centerLng) * scale * 1.05;
          const ptY = canvasRef.current.clientHeight * 0.5 - (st.centerLat - centerLat) * scale;

          if (Math.hypot(mouseX - ptX, mouseY - ptY) < 28) {
            foundState = st;
            break;
          }
        }
        setHoveredState(foundState);
      }
    }

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      const scale = (Math.min(canvasRef.current.clientWidth, canvasRef.current.clientHeight) / 33) * zoomLevel;
      setCenterLng((prev) => prev - (deltaX / scale) * 0.95);
      setCenterLat((prev) => prev + (deltaY / scale) * 0.95);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    if (hoveredEvent) {
      onSelectEvent(hoveredEvent);
      // Smoothly pan camera to event
      targetCameraRef.current = {
        lat: hoveredEvent.lat,
        lng: hoveredEvent.lng,
        zoom: Math.max(1.35, zoomLevel),
      };
    } else if (hoveredState) {
      targetCameraRef.current = {
        lat: hoveredState.centerLat,
        lng: hoveredState.centerLng,
        zoom: 1.35,
      };
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoomLevel((z) => Math.max(0.7, Math.min(2.5, z - e.deltaY * 0.0012)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] xl:h-[680px] rounded-2xl bg-[#040B17] border border-cyan-500/30 overflow-hidden select-none shadow-2xl"
    >
      {/* Interactive Map Canvas */}
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

      {/* Floating 5-Mode Control: WEATHER | RADAR | SATELLITE | EVENTS | THREAT (Requirement 13) */}
      <div className="absolute top-3 left-3 sm:left-4 z-20 flex items-center p-1 rounded-xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md shadow-xl text-[10.5px] font-mono font-bold">
        <button
          type="button"
          onClick={() => setMode('WEATHER')}
          className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
            activeMode === 'WEATHER'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CloudRain className="w-3 h-3" />
          <span>WEATHER</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('RADAR')}
          className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
            activeMode === 'RADAR'
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
            activeMode === 'SATELLITE'
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
            activeMode === 'EVENTS'
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
            activeMode === 'THREAT'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>THREAT</span>
        </button>
      </div>

      {/* Floating Spatial Camera Controls (Focus India / Center on Me / Zoom) */}
      <div className="absolute top-3 right-3 sm:right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-xl text-xs font-mono text-slate-300">
        <button
          type="button"
          onClick={centerOnUser}
          className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-bold flex items-center gap-1 cursor-pointer"
          title="Center Map on Active GPS Location"
        >
          <Crosshair className="w-3 h-3" />
          <span className="hidden sm:inline">Center on Me</span>
        </button>

        <button
          type="button"
          onClick={focusIndiaFull}
          className="px-2.5 py-1 rounded-lg hover:bg-slate-800 text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
          title="Reset to Full India View"
        >
          <Compass className="w-3 h-3" />
          <span className="hidden sm:inline">Focus India</span>
        </button>

        <div className="w-[1px] h-4 bg-slate-800" />

        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hover Tooltip (Requirement 3) */}
      {hoveredEvent && tooltipPos && (
        <div
          style={{ left: `${tooltipPos.x + 14}px`, top: `${tooltipPos.y - 12}px` }}
          className="absolute z-30 pointer-events-none p-2.5 rounded-xl bg-slate-950/95 border border-cyan-500/50 backdrop-blur-md shadow-2xl text-xs text-white min-w-[200px] animate-in fade-in duration-100"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: hoveredEvent.color }}
            />
            <span className="font-mono font-bold text-white text-[11px] uppercase">
              {hoveredEvent.type}
            </span>
          </div>
          <div className="text-[10px] text-cyan-300 font-mono">
            {hoveredEvent.city}, {hoveredEvent.state}
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9.5px] font-mono text-slate-400">
            <span>{hoveredEvent.sourcesCount} SOURCES</span>
            <span className="font-bold text-emerald-400">{hoveredEvent.confidence}% CONFIDENCE</span>
            <span className="text-cyan-300 font-bold">{hoveredEvent.status}</span>
          </div>
        </div>
      )}

      {/* State Hover HUD Tooltip */}
      {hoveredState && !hoveredEvent && (
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none p-2 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-2">
          <span className="text-cyan-400 font-bold uppercase">{hoveredState.name}</span>
          <span>•</span>
          <span>Events: <strong className="text-white">{hoveredState.activeEvents}</strong></span>
          <span>•</span>
          <span>Dominant: <strong className="text-cyan-300">{hoveredState.dominantEvent}</strong></span>
        </div>
      )}

      {/* Dynamic Weather Legend Strip (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md text-[9.5px] font-mono text-slate-300">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Rainfall</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Heatwave</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Thunderstorm</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Flood Basin</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Severe</span>
        </span>
      </div>
    </div>
  );
};
