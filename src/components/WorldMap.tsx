import { useEffect, useRef, useState } from 'react';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useGameStore } from '../state/gameStore';
import type { City } from '../sim/types';

interface CitySize {
  city: City;
  x: number;
  y: number;
  radius: number;
  infectionRatio: number;
}

function infectionColor(ratio: number, detected: boolean): string {
  if (ratio <= 0.0001) return detected ? '#a3a3a3' : '#e2e8f0';
  if (ratio < 0.01) return '#fde68a';
  if (ratio < 0.05) return '#fb923c';
  if (ratio < 0.2) return '#dc2626';
  if (ratio < 0.5) return '#991b1b';
  return '#5b0f0f';
}

export function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [features, setFeatures] = useState<Feature<Geometry>[] | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 1200, h: 600 });
  const cities = useGameStore((s) => s.cities);
  const selectedCityId = useGameStore((s) => s.selectedCityId);
  const selectCity = useGameStore((s) => s.selectCity);

  useEffect(() => {
    let cancelled = false;
    fetch('/world-110m.json')
      .then((r) => r.json())
      .then((topology) => {
        if (cancelled) return;
        const obj = topology.objects.countries ?? topology.objects[Object.keys(topology.objects)[0]];
        const geo = feature(topology, obj) as unknown as FeatureCollection<Geometry>;
        setFeatures(geo.features);
      })
      .catch(() => {
        if (!cancelled) setFeatures([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDims({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    canvas.style.width = `${dims.w}px`;
    canvas.style.height = `${dims.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, dims.w, dims.h);

    const projection = geoEquirectangular()
      .scale(dims.w / (2 * Math.PI))
      .translate([dims.w / 2, dims.h / 2]);
    const path = geoPath(projection, ctx);

    if (features) {
      ctx.fillStyle = '#1a2236';
      ctx.strokeStyle = '#2a3550';
      ctx.lineWidth = 0.5;
      for (const f of features) {
        ctx.beginPath();
        path(f);
        ctx.fill();
        ctx.stroke();
      }
    }

    const dots: CitySize[] = [];
    for (const city of Object.values(cities)) {
      const proj = projection([city.lng, city.lat]);
      if (!proj) continue;
      const [x, y] = proj;
      const N = city.S + city.E + city.I + city.R + city.D;
      const ratio = N > 0 ? (city.E + city.I) / N : 0;
      const baseR = Math.min(12, Math.max(2, Math.sqrt(city.population) / 1500));
      const pulse = ratio > 0.001 ? 1 + Math.sin(Date.now() / 600) * 0.15 : 1;
      dots.push({ city, x, y, radius: baseR * pulse, infectionRatio: ratio });
    }

    // transport arcs (light visual)
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.18)';
    ctx.lineWidth = 1;
    for (const { city, x, y, infectionRatio } of dots) {
      if (infectionRatio < 0.05) continue;
      for (const toId of city.ports.air) {
        const to = cities[toId];
        if (!to) continue;
        const proj = projection([to.lng, to.lat]);
        if (!proj) continue;
        const [tx, ty] = proj;
        if (Math.abs(tx - x) > dims.w * 0.6) continue;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const midX = (x + tx) / 2;
        const midY = (y + ty) / 2 - 30;
        ctx.quadraticCurveTo(midX, midY, tx, ty);
        ctx.stroke();
      }
    }

    for (const { city, x, y, radius, infectionRatio } of dots) {
      const color = infectionColor(infectionRatio, city.detected);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (city.id === selectedCityId) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (city.detected) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (city.interventions.has('lockdown')) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    const handleClick = (ev: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      let best: { id: string; dist: number } | null = null;
      for (const { city, x, y, radius } of dots) {
        const dx = cx - x;
        const dy = cy - y;
        const dist = Math.hypot(dx, dy);
        if (dist <= radius + 6) {
          if (!best || dist < best.dist) best = { id: city.id, dist };
        }
      }
      if (best) selectCity(best.id);
      else selectCity(null);
    };
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [features, dims, cities, selectedCityId, selectCity]);

  return (
    <div ref={containerRef} className="relative h-full w-full" data-testid="world-map">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {!features && (
        <div className="absolute inset-0 flex items-center justify-center text-ink-300">
          Loading world data…
        </div>
      )}
    </div>
  );
}
