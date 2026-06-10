export type UserRole = 'Employee' | 'Manager' | 'HR' | 'SeniorManager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  title: string;
  location: string;
  avatar: string;
  managerId?: string;
}

export interface AppraisalCycle {
  id: string;
  name: string;
  type: 'Mid-Year' | 'End-Year';
  year: number;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Closed';
  ratingScale: {
    min: number;
    max: number;
    labels: Record<number, string>;
  };
  weights: {
    goals: number;       // e.g., 70
    competencies: number; // e.g., 30
  };
  peerFeedbackEnabled: boolean;
}

export interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  title: string;
  description: string;
  weight: number;
  target: string;
  actual: string;
  targetValue: number;
  actualValue: number;
  progress: number; // 0 to 100
  status: 'Draft' | 'Pending Approval' | 'Revision Required' | 'Approved' | 'Rejected';
  evidence: string;
  submittedDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  managerComment?: string;
  lastUpdated: string;
  category: 'Technical' | 'Business' | 'Development' | 'People';
  evidenceUrl?: string;
  evidenceName?: string;
}

export interface AdditionalFeedback {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface FeedbackRequest {
  id: string;
  reviewerId: string;
  reviewerName: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
}

export interface PeerReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail?: string;
  ratings?: {
    collaboration: number;
    communication: number;
    problemSolving: number;
    leadership: number;
    teamwork: number;
    accountability: number;
  };
  comments?: string;
  strengths?: string;
  areasForImprovement?: string;
  status: 'Requested' | 'In Progress' | 'Completed' | 'Cancelled' | 'Expired';
  isSubmitted: boolean;
  submittedAt?: string;
  createdAt: string;
}

export interface Appraisal {
  id: string;
  employeeId: string;
  cycleId: string;
  currentStage: 'GoalSetup' | 'SelfAppraisal' | 'ManagerAppraisal' | 'Calibration' | 'SignOff' | 'Completed';
  isGoalApproved: boolean;
  
  selfAppraisal: {
    strengths: string;
    opportunities: string;
    blockers: string;
    status: 'Draft' | 'Submitted';
    submittedAt?: string;
  };
  
  feedbackRequests: FeedbackRequest[];
  additionalFeedback: AdditionalFeedback[];
  peerReviews: PeerReview[];
  
  managerAppraisal: {
    ratingGoals?: number;
    ratingCompetencies?: number;
    calculatedScore?: number;
    justification: string; // mandatory 250 characters if rating is 5.0 (highest) or 1.0 (lowest)
    inflationAcknowledged?: boolean;
    status: 'Draft' | 'Submitted';
    submittedAt?: string;
  };
  
  calibration: {
    originalCalculatedScore?: number;
    calibratedScore?: number;
    changeReason?: string;
    calibratedBy?: string;
    calibratedAt?: string;
    isSubmitted?: boolean;
    submittedAt?: string;
  };
  
  signOff: {
    employeeSigned: boolean;
    employeeSignedAt?: string;
    employeeReflections?: string;
    employeeRebuttal?: string;
    managerSigned: boolean;
    managerSignedAt?: string;
    managerFinalComments?: string;
    isLocked: boolean;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  appraisalId?: string;
  employeeId?: string;
  cycleId?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g., 'Goal Created', 'Goal Approved', 'Self Appraisal Submitted', 'Additional Feedback Submitted', 'Manager Score Submitted', 'Calibration Modified', 'Digital Signed', 'Unlocked by HR'
  details: string;
}
