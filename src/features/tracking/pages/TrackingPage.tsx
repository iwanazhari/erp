import { useState, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';
import { useActiveSessions, useUserTracking } from '@/features/tracking/hooks/useTracking';
import { useTrackingWebSocket } from '@/features/tracking/hooks/useTrackingWebSocket';

const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];

const COLORS = ['#0052FF', '#DC2626', '#059669', '#D97706', '#7C3AED', '#0891B2', '#DB2777', '#65A30D'];

function makeIcon(bg: string, label: string, size = 28) {
  return new L.DivIcon({
    className: '',
    html: `<div style="background:${bg};color:#fff;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.45}px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function startIcon(label: string) {
  return new L.DivIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><div style="background:#16a34a;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">S</div><span style="font-size:10px;font-weight:600;color:#16a34a;text-shadow:0 1px 2px #fff">${label}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function endIcon(label: string) {
  return new L.DivIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><div style="background:#dc2626;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:3px solid #fff;box-shadow:0 0 0 3px rgba(220,38,38,.3)">E</div><span style="font-size:10px;font-weight:600;color:#dc2626;text-shadow:0 1px 2px #fff">${label}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function liveIcon(bg: string, label: string) {
  return new L.DivIcon({
    className: '',
    html: `<div style="position:relative;width:36px;height:36px"><div style="position:absolute;inset:0;border-radius:50%;background:${bg};opacity:.25;animation:pulse-ring 2s ease-out infinite"></div><div style="position:absolute;inset:4px;border-radius:50%;background:${bg};opacity:.15;animation:pulse-ring 2s ease-out infinite .5s"></div><div style="position:absolute;inset:6px;background:${bg};color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)">${label}</div></div>
<style>@keyframes pulse-ring{0%{transform:scale(1);opacity:.25}100%{transform:scale(1.8);opacity:0}}</style>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function FitBoundsOnData({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.setView(JAKARTA_CENTER, 11);
    }
  }, [points, map]);
  return null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatTimeFull(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

export default function TrackingPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const { data: sessions = [], isLoading: loadingSessions } = useActiveSessions(wsConnected ? 60_000 : 30_000);
  const { data: userTracking } = useUserTracking(selectedUserId, today, wsConnected ? 10_000 : 15_000);

  useTrackingWebSocket({
    enabled: true,
    onPositionUpdate: () => {
      setWsConnected(true);
    },
  });

  // Auto-select first active user when sessions load
  useEffect(() => {
    if (!selectedUserId && sessions.length > 0) {
      const first = sessions.find((s) => s.lastLocation);
      if (first) setSelectedUserId(first.userId);
    }
  }, [sessions, selectedUserId]);

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserId((prev) => (prev === userId ? null : userId));
  }, []);

  const pathPoints = useMemo<[number, number][]>(() => {
    if (!userTracking?.locations) return [];
    return userTracking.locations.map((l) => [l.latitude, l.longitude] as [number, number]);
  }, [userTracking]);

  const allViewPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [...pathPoints];
    for (const s of sessions) {
      if (s.lastLocation && s.userId !== selectedUserId) {
        pts.push([s.lastLocation.latitude, s.lastLocation.longitude]);
      }
    }
    return pts;
  }, [pathPoints, sessions, selectedUserId]);

  const selectedSession = useMemo(() => {
    if (!selectedUserId) return null;
    return sessions.find((s) => s.userId === selectedUserId);
  }, [sessions, selectedUserId]);

  const activeMarkers = useMemo(() => {
    return sessions.filter((s) => s.lastLocation);
  }, [sessions]);

  const idleUsers = useMemo(() => {
    return sessions.filter((s) => !s.lastLocation);
  }, [sessions]);

  const userColorIndex = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s, i) => map.set(s.userId, i % COLORS.length));
    return map;
  }, [sessions]);

  const selectedColor = selectedUserId ? COLORS[userColorIndex.get(selectedUserId) || 0] : '#0052FF';

  const firstPoint = pathPoints.length > 0 ? pathPoints[0] : null;
  const lastPoint = pathPoints.length > 0 ? pathPoints[pathPoints.length - 1] : null;

  return (
    <PageContainer title="Live Tracking">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        {/* Map */}
        <Card padding="none" className="h-[75vh] min-h-[400px] overflow-hidden relative">
          {wsConnected && (
            <div className="absolute top-2 right-2 z-[1000] flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-md">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          )}
          <MapContainer
            center={JAKARTA_CENTER}
            zoom={11}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBoundsOnData points={allViewPoints} />

            {/* Active user markers (non-selected) */}
            {activeMarkers
              .filter((s) => s.userId !== selectedUserId)
              .map((s) => (
                <Marker
                  key={s.userId}
                  position={[s.lastLocation!.latitude, s.lastLocation!.longitude]}
                  icon={makeIcon('#6B7280', getInitial(s.name), 24)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-gray-500">Last: {formatTime(s.lastLocation!.timestamp)}</p>
                      <p className="text-xs text-gray-500">Points: {s.totalPoints}</p>
                      <button
                        className="mt-1 text-xs text-blue-600 hover:underline"
                        onClick={() => handleSelectUser(s.userId)}
                      >
                        Lihat rute
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Selected user path line */}
            {pathPoints.length > 1 && (
              <>
                <Polyline
                  positions={pathPoints}
                  color={selectedColor}
                  weight={4}
                  opacity={0.8}
                />
                {/* Start marker */}
                {firstPoint && (
                  <Marker position={firstPoint} icon={startIcon(formatTime(userTracking?.locations?.[0]?.timestamp || ''))}>
                    <Popup>Start: {userTracking?.locations?.[0]?.timestamp ? formatTimeFull(userTracking.locations[0].timestamp) : ''}</Popup>
                  </Marker>
                )}
                {/* End / latest marker */}
                {lastPoint && (
                  <Marker position={lastPoint} icon={endIcon(formatTime(userTracking?.locations?.[userTracking.locations.length - 1]?.timestamp || ''))}>
                    <Popup>End: {userTracking?.locations?.[userTracking.locations.length - 1]?.timestamp ? formatTimeFull(userTracking.locations[userTracking.locations.length - 1].timestamp) : ''}</Popup>
                  </Marker>
                )}
              </>
            )}

            {/* Selected user current location — animated live marker */}
            {selectedSession?.lastLocation && (
              <Marker
                position={[selectedSession.lastLocation.latitude, selectedSession.lastLocation.longitude]}
                icon={liveIcon(selectedColor, getInitial(selectedSession.name))}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{selectedSession.name}</p>
                    <p className="text-xs text-gray-500">Clock in: {formatTime(selectedSession.clockIn)}</p>
                    <p className="text-xs text-gray-500">Last: {formatTimeFull(selectedSession.lastLocation.timestamp)}</p>
                    <p className="text-xs text-gray-500">Points: {selectedSession.totalPoints}</p>
                    {wsConnected && <p className="text-xs text-green-600 font-medium">● Live</p>}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </Card>

        {/* Sidebar */}
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[75vh]">
          {/* Selected user info */}
          {selectedUserId && userTracking && selectedSession && (
            <Card padding="sm" className="shrink-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{userTracking.userName}</h3>
                  <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                    <p>Clock in: <span className="font-medium text-gray-700">{formatTime(selectedSession.clockIn)}</span></p>
                    <p>Total titik: <span className="font-medium text-gray-700">{userTracking.totalPoints}</span></p>
                    <p>Total jarak: <span className="font-medium text-gray-700">{formatDistance(userTracking.totalDistance)}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor }} />
                  <button
                    className="text-xs text-red-500 hover:underline ml-1"
                    onClick={() => setSelectedUserId(null)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
              {userTracking.locations.length >= 2 && (
                <div className="mt-2 flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-600" /> S
                  </span>
                  <span className="text-xs text-gray-400">&rarr;</span>
                  <span className="inline-flex items-center gap-1 text-xs text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-600" /> E
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Active users list */}
          <Card padding="sm" className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-2 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold">
                Active <span className="text-xs font-normal text-gray-400">({sessions.length})</span>
              </h3>
              <span className={`text-[10px] font-medium ${wsConnected ? 'text-green-600' : 'text-gray-400'}`}>
                {wsConnected ? '● WS Connected' : '○ Polling'}
              </span>
            </div>
            {loadingSessions ? (
              <p className="text-xs text-gray-400">Loading...</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-gray-400">Tidak ada teknisi aktif saat ini</p>
            ) : (
              <ul className="space-y-0.5 overflow-y-auto flex-1">
                {activeMarkers.map((s) => {
                  const isSelected = s.userId === selectedUserId;
                  const color = COLORS[userColorIndex.get(s.userId) || 0];
                  return (
                    <li key={s.userId}>
                      <button
                        className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-all ${
                          isSelected
                            ? 'bg-gray-100 ring-1 ring-gray-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectUser(s.userId)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: isSelected ? color : '#22c55e' }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{s.name}</p>
                            <p className="truncate text-xs text-gray-400">
                              {s.lastLocation ? formatTime(s.lastLocation.timestamp) : 'No location'}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-medium text-gray-600">{s.totalPoints}</p>
                            <p className="text-[10px] text-gray-400">pts</p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
                {idleUsers.map((s) => (
                  <li key={s.userId}>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-400">
                      <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-gray-300" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{s.name}</p>
                        <p className="truncate text-xs">No location data</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
