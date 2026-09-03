import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { gpx_text, athlete_id, athlete_name, source } = await req.json();

    // Authorization: only admins (coaches) or the athlete themselves may create logs
    if (user.role !== 'admin' && user.id !== athlete_id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!gpx_text || typeof gpx_text !== 'string' || gpx_text.length > 500000) {
      return Response.json({ error: 'GPX inválido o demasiado grande (máx 500 KB)' }, { status: 400 });
    }

    // Parse key fields from GPX XML using regex (no external parser needed)
    const nameMatch = gpx_text.match(/<name>([^<]+)<\/name>/);
    const title = nameMatch ? nameMatch[1] : 'Actividad importada';

    // Extract time points for duration
    const timeMatches = [...gpx_text.matchAll(/<time>([^<]+)<\/time>/g)];
    let duration_min = 0;
    if (timeMatches.length >= 2) {
      const start = new Date(timeMatches[0][1]);
      const end = new Date(timeMatches[timeMatches.length - 1][1]);
      duration_min = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    // Extract track points for distance calculation (haversine)
    const trkpts = [...gpx_text.matchAll(/<trkpt lat="([^"]+)" lon="([^"]+)">/g)];
    let distance_km = 0;
    for (let i = 1; i < trkpts.length; i++) {
      const lat1 = parseFloat(trkpts[i-1][1]), lon1 = parseFloat(trkpts[i-1][2]);
      const lat2 = parseFloat(trkpts[i][1]),   lon2 = parseFloat(trkpts[i][2]);
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
      distance_km += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    distance_km = Math.round(distance_km * 100) / 100;

    // Elevation gain
    const eleMatches = [...gpx_text.matchAll(/<ele>([^<]+)<\/ele>/g)];
    let elevation_gain_m = 0;
    for (let i = 1; i < eleMatches.length; i++) {
      const diff = parseFloat(eleMatches[i][1]) - parseFloat(eleMatches[i-1][1]);
      if (diff > 0) elevation_gain_m += diff;
    }
    elevation_gain_m = Math.round(elevation_gain_m);

    // Average HR from Garmin extensions
    const hrMatches = [...gpx_text.matchAll(/<gpxtpx:hr>(\d+)<\/gpxtpx:hr>/g)];
    let avg_hr = 0;
    if (hrMatches.length > 0) {
      avg_hr = Math.round(hrMatches.reduce((s, m) => s + parseInt(m[1]), 0) / hrMatches.length);
    }

    // Date from first time tag
    const date = timeMatches.length > 0
      ? timeMatches[0][1].substring(0, 10)
      : new Date().toISOString().substring(0, 10);

    // Avg pace in sec/km
    const avg_pace_sec_km = distance_km > 0 && duration_min > 0
      ? Math.round((duration_min * 60) / distance_km)
      : 0;

    const record = {
      athlete_id,
      athlete_name,
      date,
      source: source || 'gpx_file',
      activity_type: 'run',
      title,
      distance_km,
      duration_min,
      avg_pace_sec_km,
      elevation_gain_m,
      avg_hr: avg_hr || undefined,
    };

    const created = await base44.entities.TrainingLog.create(record);
    return Response.json({ success: true, log: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}