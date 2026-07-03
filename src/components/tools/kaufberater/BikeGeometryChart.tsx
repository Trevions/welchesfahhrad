// BikeGeometryChart — SVG-Visualisierung des empfohlenen Rahmens.
//
// Zeichnet ein technisches Schema-Rad (2D, Seitenansicht) mit
// den Zielwerten Reach, Stack, Sattelhöhe, Sitzwinkel, Steuerkopfwinkel,
// und markiert die Position des Fahrers (Sattel, Cockpit, Kurbel).
//
// Rendert rein aus CalculationResult — keine externen Libs.

import type { CalculationResult } from "@/lib/kaufberater/types";

type Props = {
  calc: CalculationResult;
};

export function BikeGeometryChart({ calc }: Props) {
  const reach = (calc.reachMm.min + calc.reachMm.max) / 2;
  const stack = (calc.stackMm.min + calc.stackMm.max) / 2;
  const saddleH = calc.saddleHeightMm.recommended;
  const staMid = (calc.bikefit.seatTubeAngle.min + calc.bikefit.seatTubeAngle.max) / 2;
  const htaMid = (calc.bikefit.headTubeAngle.min + calc.bikefit.headTubeAngle.max) / 2;
  const setback = calc.bikefit.setbackMm.recommended;
  const ett = calc.bikefit.ettMm.recommended;

  // SVG-Koordinaten: 1 mm → 0.4 px, Ursprung = Tretlager (BB).
  const scale = 0.4;
  const W = 640;
  const H = 420;
  const bbX = 190;
  const bbY = 310;

  // Front axle: aus Reach nach vorne + STA-Neigung (grob geschätzt: Radstand)
  const wheelbase = 1080; // typischer Trekking-Wert; nur zur Darstellung
  const headTubeToBb = wheelbase - 430; // Front-Center näherungsweise

  const staRad = ((180 - staMid) * Math.PI) / 180;
  const htaRad = ((180 - htaMid) * Math.PI) / 180;

  // Head-Tube-Top position (Stack höhe, Reach vorwärts von BB)
  const htTopX = bbX + reach * scale;
  const htTopY = bbY - stack * scale;

  // Sattel-Position (Setback zurück von BB, Höhe = saddleH entlang STA)
  const saddleX = bbX - setback * scale;
  const saddleY = bbY - saddleH * scale * Math.sin(((90 - (90 - staMid)) * Math.PI) / 180);

  // Sitzrohr-Verlauf: Von BB im STA nach oben
  const seatTubeLen = saddleH; // vereinfachend
  const seatTopX = bbX + Math.cos(((90 + staMid) * Math.PI) / 180) * seatTubeLen * scale;
  const seatTopY = bbY - Math.sin(((90 + staMid) * Math.PI) / 180) * seatTubeLen * scale;

  // Front axle (approx.)
  const frontAxleX = htTopX + Math.cos(htaRad) * (headTubeToBb - reach) * scale * 0.5 + 90;
  const frontAxleY = bbY;
  const rearAxleX = bbX - 170;
  const rearAxleY = bbY;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Rahmengeometrie-Empfehlung">
        {/* Boden */}
        <line x1="20" y1={bbY} x2={W - 20} y2={bbY} stroke="currentColor" strokeOpacity="0.15" strokeDasharray="4 4" />

        {/* Räder */}
        <circle cx={rearAxleX} cy={rearAxleY} r="55" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
        <circle cx={frontAxleX} cy={frontAxleY} r="55" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />

        {/* Rahmen — Sitzrohr */}
        <line x1={bbX} y1={bbY} x2={seatTopX} y2={seatTopY} stroke="currentColor" strokeWidth="4" />
        {/* Unterrohr → Steuerkopf-Unterkante */}
        <line x1={bbX} y1={bbY} x2={htTopX} y2={htTopY + 30} stroke="currentColor" strokeWidth="4" />
        {/* Oberrohr — Sitz-Top → Steuerkopf-Top */}
        <line x1={seatTopX} y1={seatTopY} x2={htTopX} y2={htTopY} stroke="currentColor" strokeWidth="4" />
        {/* Steuerkopfrohr */}
        <line x1={htTopX} y1={htTopY} x2={htTopX + 8} y2={htTopY + 40} stroke="currentColor" strokeWidth="5" />
        {/* Gabel */}
        <line x1={htTopX + 8} y1={htTopY + 40} x2={frontAxleX} y2={frontAxleY} stroke="currentColor" strokeWidth="3" />
        {/* Kettenstrebe */}
        <line x1={bbX} y1={bbY} x2={rearAxleX} y2={rearAxleY} stroke="currentColor" strokeWidth="3" strokeOpacity="0.6" />

        {/* Reach- und Stack-Linien (Signal-Farbe) */}
        <line x1={bbX} y1={bbY} x2={htTopX} y2={bbY} stroke="var(--signal)" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1={htTopX} y1={bbY} x2={htTopX} y2={htTopY} stroke="var(--signal)" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Fahrer-Markierungen */}
        <circle cx={saddleX} cy={saddleY} r="8" fill="var(--signal)" opacity="0.8" />
        <circle cx={htTopX} cy={htTopY - 10} r="6" fill="var(--signal)" opacity="0.6" />
        <circle cx={bbX} cy={bbY} r="6" fill="currentColor" opacity="0.7" />

        {/* Labels */}
        <text x={bbX + reach * scale * 0.5 - 20} y={bbY + 18} fill="var(--signal)" fontSize="11" fontFamily="ui-monospace, monospace">
          Reach {Math.round(reach)} mm
        </text>
        <text x={htTopX + 8} y={bbY - stack * scale * 0.5} fill="var(--signal)" fontSize="11" fontFamily="ui-monospace, monospace">
          Stack {Math.round(stack)} mm
        </text>
        <text x={saddleX - 45} y={saddleY - 12} fill="var(--signal)" fontSize="10" fontFamily="ui-monospace, monospace">
          Sattel {saddleH} mm
        </text>
        <text x={bbX - 20} y={bbY + 40} fill="currentColor" fontSize="10" opacity="0.6" fontFamily="ui-monospace, monospace">
          Tretlager
        </text>
        <text x={htTopX - 5} y={htTopY - 18} fill="currentColor" fontSize="10" opacity="0.6" fontFamily="ui-monospace, monospace">
          Cockpit
        </text>

        {/* Winkel-Labels */}
        <text x={seatTopX - 40} y={seatTopY - 10} fill="currentColor" fontSize="10" opacity="0.7" fontFamily="ui-monospace, monospace">
          STA {staMid.toFixed(1)}°
        </text>
        <text x={htTopX + 18} y={htTopY + 30} fill="currentColor" fontSize="10" opacity="0.7" fontFamily="ui-monospace, monospace">
          HTA {htaMid.toFixed(1)}°
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-3 text-[11px] text-muted-foreground sm:grid-cols-4">
        <div>
          <div className="text-[9px] uppercase tracking-[0.16em]">Effektive Oberrohr (ETT)</div>
          <div className="mt-0.5 font-mono text-signal">{ett} mm</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.16em]">Setback (KOPS)</div>
          <div className="mt-0.5 font-mono text-signal">{setback} mm</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.16em]">STA-Ziel</div>
          <div className="mt-0.5 font-mono">{calc.bikefit.seatTubeAngle.min}–{calc.bikefit.seatTubeAngle.max}°</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.16em]">HTA-Ziel</div>
          <div className="mt-0.5 font-mono">{calc.bikefit.headTubeAngle.min}–{calc.bikefit.headTubeAngle.max}°</div>
        </div>
      </div>
    </div>
  );
}
