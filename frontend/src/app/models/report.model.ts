export interface ReportOverview {
  period: string;
  entriesByType: {
    operativa?: number;
    incidente?: number;
  };
  incidentsByUser: Array<{
    _id: string;
    count: number;
  }>;
  topTags: Array<{
    _id: string;
    count: number;
  }>;
  redsByService: Array<{
    _id: string;
    count: number;
  }>;
  entriesTrend: Array<{
    _id: string;
    count: number;
  }>;
  totalUsers: number;
  totalChecks: number;
}

export interface TagStats {
  tag: string;
  count: number;
}
