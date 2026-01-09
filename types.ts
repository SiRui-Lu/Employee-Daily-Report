
export interface ClothingBreakdown {
  clothes: number;
  shoes: number;
  bedding: number;
}

export interface PeriodData {
  in: {
    student: ClothingBreakdown;
    staff: ClothingBreakdown;
  };
  out: {
    student: number;
    staff: number;
    failedReason: string;
  };
  feedback: {
    positive: string;
    issues: string;
    results: string;
  };
  tasks: string;
  problems: string; // Simplified to a single string
}

export interface DailyReport {
  date: string;
  employeeName: string;
  morning: PeriodData;
  afternoon: PeriodData;
  summary: {
    tomorrowPlan: string;
  };
}
