export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AnalysisResponse {
  success: boolean;
  reportId?: number;
  analysis?: any;
  error?: string;
}

export interface ReportListResponse {
  success: boolean;
  reports?: Array<{
    id: number;
    patientName: string;
    patientAge: string;
    patientGender?: string;
    createdAt: string;
    analysis?: any;
  }>;
  error?: string;
}
