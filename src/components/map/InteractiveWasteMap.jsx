import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

export const InteractiveWasteMap = ({
  complaints = [],
  selectedId = null,
  onSelectComplaint = () => {},
  height = '560px',
  interactive = true,
  zoom = 12,
  center = [13.045, 80.235] // Chennai Municipal Center
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      attributionControl: interactive
    });

    // Real OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when complaints or selectedId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    complaints.forEach(complaint => {
      if (!complaint.latitude || !complaint.longitude) return;

      const isSelected = selectedId === complaint.id;
      const isCritical = complaint.priority === 'CRITICAL';
      const isHigh = complaint.priority === 'HIGH';
      const isMedium = complaint.priority === 'MEDIUM';

      const color = isCritical
        ? '#FB7185'
        : isHigh
        ? '#F59E0B'
        : isMedium
        ? 'var(--accent-primary)'
        : '#34D399';

      const size = isSelected ? 32 : isCritical ? 28 : 22;

      // Custom Liquid Glass HTML Marker
      const customIcon = L.divIcon({
        className: 'custom-liquid-glass-pin',
        html: `
          <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isCritical ? `<div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(251, 113, 133, 0.35); animation: pulseSubtle 1.5s infinite ease-in-out;"></div>` : ''}
            <div style="
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              background: ${color};
              border: 2.5px solid var(--text-primary);
              box-shadow: 0 0 16px ${color}, 0 4px 12px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: ${size > 26 ? '12px' : '10px'};
              font-family: var(--font-sans);
            ">
              ${isCritical ? '!' : '●'}
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
      });

      const marker = L.marker([complaint.latitude, complaint.longitude], { icon: customIcon }).addTo(map);

      // Liquid Glass Popup
      const popupContent = document.createElement('div');
      popupContent.style.padding = '8px 10px';
      popupContent.style.minWidth = '220px';
      popupContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-family: var(--font-mono); font-weight: 700; font-size: 11px; color: var(--accent-primary);">${complaint.id}</span>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${color}25; color: ${color};">${complaint.priority}</span>
        </div>
        <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 3px;">${complaint.wasteType}</div>
        <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">📍 ${complaint.location}</div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
          <span>Severity: <strong style="color: var(--text-primary);">${complaint.severity}/10</strong></span>
          <span>Status: <strong style="color: var(--text-primary);">${complaint.status}</strong></span>
        </div>
        <button id="view-complaint-${complaint.id}" style="
          width: 100%;
          padding: 6px 12px;
          border-radius: 6px;
          background: var(--accent-primary);
          color: var(--text-inverse);
          font-weight: 600;
          font-size: 11px;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px var(--accent-cyan-glow);
          transition: transform 0.15s ease;
        ">
          VIEW COMPLAINT →
        </button>
      `;

      // Attach View Complaint click listener
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-complaint-${complaint.id}`);
        if (btn) {
          btn.onclick = () => navigate(`/complaints/${complaint.id}`);
        }
      });

      marker.on('click', () => {
        onSelectComplaint(complaint);
      });

      markersRef.current[complaint.id] = marker;
    });
  }, [complaints, selectedId]);

  return (
    <div
      style={{
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'var(--shadow-lg), inset 0 1px 0 var(--glass-highlight)',
        border: '1px solid var(--glass-border)'
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
