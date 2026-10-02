import React from 'react';

export const AtmosphericGeospatialBackground: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Deep midnight navy base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#040814] via-[#071124] to-[#040916]" />

      {/* Atmospheric radial glow lights */}
      <div className="absolute -top-[15%] left-[10%] w-[800px] h-[600px] rounded-full bg-cyan-900/10 blur-[130px]" />
      <div className="absolute top-[35%] right-[5%] w-[700px] h-[500px] rounded-full bg-blue-900/10 blur-[140px]" />
      <div className="absolute bottom-[5%] left-[25%] w-[900px] h-[550px] rounded-full bg-teal-900/8 blur-[150px]" />

      {/* Coordinate Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="geo-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="0.8"
              strokeDasharray="2,6"
            />
            <circle cx="80" cy="0" r="1.5" fill="#38BDF8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo-grid)" />
      </svg>

      {/* Geospatial Radar Concentric Circles */}
      <svg
        className="absolute right-[-150px] top-[10%] w-[900px] h-[900px] opacity-[0.045]"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="400" cy="400" r="120" fill="none" stroke="#06B6D4" strokeWidth="1.2" strokeDasharray="4,8" />
        <circle cx="400" cy="400" r="220" fill="none" stroke="#06B6D4" strokeWidth="1.2" strokeDasharray="3,6" />
        <circle cx="400" cy="400" r="320" fill="none" stroke="#06B6D4" strokeWidth="1" strokeDasharray="6,10" />
        <circle cx="400" cy="400" r="390" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
        <line x1="400" y1="10" x2="400" y2="790" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="2,4" />
        <line x1="10" y1="400" x2="790" y2="400" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="2,4" />
        {/* Degree markers */}
        <text x="410" y="30" fill="#06B6D4" fontSize="10" fontFamily="monospace" opacity="0.6">000° N</text>
        <text x="740" y="395" fill="#06B6D4" fontSize="10" fontFamily="monospace" opacity="0.6">090° E</text>
        <text x="410" y="785" fill="#06B6D4" fontSize="10" fontFamily="monospace" opacity="0.6">180° S</text>
        <text x="15" y="395" fill="#06B6D4" fontSize="10" fontFamily="monospace" opacity="0.6">270° W</text>
      </svg>

      {/* Atmospheric Isobar Contour Curves */}
      <svg
        className="absolute left-[-100px] bottom-[5%] w-[850px] h-[550px] opacity-[0.035]"
        viewBox="0 0 850 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 0 100 Q 200 40 450 180 T 850 120" stroke="#22D3EE" strokeWidth="1.2" />
        <path d="M 0 200 Q 250 120 500 260 T 850 210" stroke="#0EA5E9" strokeWidth="1.2" strokeDasharray="4,6" />
        <path d="M 0 320 Q 300 220 550 370 T 850 310" stroke="#14B8A6" strokeWidth="1" />
        <path d="M 0 440 Q 350 330 600 460 T 850 420" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="2,5" />
      </svg>

      {/* Top telemetry grid line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </div>
  );
};
