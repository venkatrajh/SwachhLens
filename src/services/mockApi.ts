import type { Report, SubmitReportPayload } from '../types/report';
import type { User } from '../types/user';

const STORAGE_KEY = 'swachhlens_reports';
const USER_KEY = 'swachhlens_current_user';

export const INITIAL_USER: User = {
  id: 'U001',
  name: 'Kavin Kumar',
  email: 'kavin@example.com',
  role: 'citizen',
  reportsSubmitted: 12,
  issuesResolved: 8,
  phone: '+91 98765 43210',
  ward: 'Ward 117 - T. Nagar, Zone 10',
};

const INITIAL_REPORTS: Report[] = [
  {
    id: 'SWL1023',
    user_id: 'U001',
    image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    latitude: 13.0827,
    longitude: 80.2707,
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    description: 'Overflowing community garbage bin near 4th cross street corner.',
    waste_type: 'Overflowing Bin',
    volume: 'large',
    severity_score: 8.7,
    priority: 'high',
    confidence: 0.94,
    duplicate: false,
    recommended_team: 'Team B (Sanitation Alpha)',
    recommended_vehicle: 'Mini Truck (TN-01-G-4421)',
    recommended_action: 'Dispatch sanitation team for immediate bin clearance',
    status: 'assigned',
  },
  {
    id: 'SWL1024',
    user_id: 'U001',
    image_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    latitude: 13.0850,
    longitude: 80.2740,
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    description: 'Dry plastic waste and PET bottles accumulated along pathway.',
    waste_type: 'Plastic & Recyclables',
    volume: 'medium',
    severity_score: 5.4,
    priority: 'medium',
    confidence: 0.91,
    duplicate: false,
    recommended_team: 'Team A (Green Wardens)',
    recommended_vehicle: 'Electric Auto Tipper',
    recommended_action: 'Route to local dry waste recycling center',
    status: 'in_progress',
    is_recyclable: true,
  },
  {
    id: 'SWL1025',
    user_id: 'U001',
    image_url: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
    latitude: 13.0780,
    longitude: 80.2650,
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    description: 'Construction rubble and broken cement blocks on roadside.',
    waste_type: 'Construction Debris',
    volume: 'very_large',
    severity_score: 8.9,
    priority: 'high',
    confidence: 0.96,
    duplicate: false,
    recommended_team: 'Heavy Duty Rapid Squad',
    recommended_vehicle: 'Compactor Truck (TN-01-H-8812)',
    recommended_action: 'Heavy debris clearance & sidewalk restoration',
    status: 'verified',
    before_image_url: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
    after_image_url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
    verified_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'SWL1018',
    user_id: 'U004',
    image_url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80',
    latitude: 13.0829,
    longitude: 80.2710,
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    description: 'Huge waste pile on main market road.',
    waste_type: 'Illegal Dumping',
    volume: 'very_large',
    severity_score: 9.4,
    priority: 'critical',
    confidence: 0.98,
    duplicate: false,
    recommended_team: 'Emergency Response Squad',
    recommended_vehicle: 'Hydraulic Dumper Truck',
    recommended_action: 'Immediate road clearance & drain blockage prevention',
    status: 'in_progress',
    is_hazardous: true,
  },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockApiService = {
  async getMyReports(): Promise<Report[]> {
    await delay(350);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_REPORTS;
    }
  },

  async getReport(id: string): Promise<Report> {
    await delay(300);
    const reports = await this.getMyReports();
    const found = reports.find(r => r.id === id);
    if (!found) {
      return {
        id,
        user_id: 'U001',
        image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        latitude: 13.0827,
        longitude: 80.2707,
        timestamp: new Date().toISOString(),
        description: 'Reported municipal waste issue.',
        waste_type: 'Mixed Waste',
        volume: 'medium',
        severity_score: 6.5,
        priority: 'medium',
        confidence: 0.92,
        duplicate: false,
        recommended_team: 'Team B',
        recommended_vehicle: 'Mini Truck',
        recommended_action: 'Dispatch sanitation team',
        status: 'pending',
      };
    }
    return found;
  },

  async submitReport(payload: SubmitReportPayload): Promise<Report> {
    await delay(1200);

    const isDuplicate = payload.description?.toLowerCase().includes('duplicate') || false;
    
    const currentReports = await this.getMyReports();
    const newIdNum = 1026 + Math.floor(Math.random() * 100);
    const reportId = `SWL${newIdNum}`;

    let imageUrl = typeof payload.image === 'string' ? payload.image : undefined;
    if (!imageUrl && payload.image instanceof Blob) {
      imageUrl = URL.createObjectURL(payload.image);
    }
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80';
    }

    const descLower = (payload.description || '').toLowerCase();
    let wasteType = 'Overflowing Bin';
    let volume: Report['volume'] = 'large';
    let severityScore = 8.7;
    let priority: Report['priority'] = 'high';
    let recommendedTeam = 'Team B';
    let recommendedVehicle = 'Mini Truck';
    let recommendedAction = 'Dispatch sanitation team';
    let isRecyclable = false;
    let isHazardous = false;

    if (descLower.includes('plastic') || descLower.includes('bottle')) {
      wasteType = 'Plastic Waste';
      volume = 'medium';
      severityScore = 6.2;
      priority = 'medium';
      recommendedTeam = 'Team A';
      recommendedVehicle = 'Electric Auto Tipper';
      recommendedAction = 'Recycling partner route';
      isRecyclable = true;
    } else if (descLower.includes('drain') || descLower.includes('chemical') || descLower.includes('hazard') || descLower.includes('urgent')) {
      wasteType = 'Hazardous Drain Blockage';
      volume = 'very_large';
      severityScore = 9.5;
      priority = 'critical';
      recommendedTeam = 'Emergency Escalation Squad';
      recommendedVehicle = 'Suction Super-Sucker';
      recommendedAction = 'Immediate urgent clearance';
      isHazardous = true;
    } else if (descLower.includes('construction') || descLower.includes('debris')) {
      wasteType = 'Construction Debris';
      volume = 'very_large';
      severityScore = 8.2;
      priority = 'high';
      recommendedTeam = 'Heavy Duty Squad';
      recommendedVehicle = 'Compactor Truck';
      recommendedAction = 'Heavy debris clearance';
    }

    const newReport: Report = {
      id: reportId,
      user_id: 'U001',
      image_url: imageUrl,
      latitude: payload.latitude || 13.0827,
      longitude: payload.longitude || 80.2707,
      timestamp: payload.timestamp || new Date().toISOString(),
      description: payload.description || 'Civic waste reported by citizen',
      waste_type: wasteType,
      volume,
      severity_score: severityScore,
      priority,
      confidence: 0.94,
      duplicate: isDuplicate,
      linked_report_id: isDuplicate ? 'SWL1018' : undefined,
      recommended_team: recommendedTeam,
      recommended_vehicle: recommendedVehicle,
      recommended_action: recommendedAction,
      status: isDuplicate ? 'duplicate' : 'pending',
      is_recyclable: isRecyclable,
      is_hazardous: isHazardous,
    };

    const updated = [newReport, ...currentReports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const user = await this.getCurrentUser();
    user.reportsSubmitted += 1;
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return newReport;
  },

  async getCurrentUser(): Promise<User> {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(USER_KEY, JSON.stringify(INITIAL_USER));
    return INITIAL_USER;
  },
};
