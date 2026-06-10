import { User, AppraisalCycle, Goal, Appraisal, AuditLog } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_marcus',
    name: 'Marcus Chen',
    email: 'marcus.chen@enterprise.com',
    role: 'Employee',
    department: 'Product Design',
    title: 'Senior UX Designer',
    location: 'North America (Remote)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr_sarah'
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@enterprise.com',
    role: 'Manager',
    department: 'Product Design',
    title: 'Design Director',
    location: 'North America (HQ)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_alex',
    name: 'Alex Sterling',
    email: 'alex.sterling@enterprise.com',
    role: 'HR',
    department: 'HR Operations',
    title: 'Chief HR Officer',
    location: 'Global Sites',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_jane',
    name: 'Jane Doe',
    email: 'jane.doe@enterprise.com',
    role: 'SeniorManager',
    department: 'Executive Leadership',
    title: 'VP of Product Experience',
    location: 'North America (HQ)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_mthorne',
    name: 'Marcus Thorne',
    email: 'marcus.thorne@enterprise.com',
    role: 'Employee',
    department: 'Engineering',
    title: 'Lead Systems Architect',
    location: 'EMEA (Remote)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr_sarah'
  },
  {
    id: 'usr_elena',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@enterprise.com',
    role: 'Employee',
    department: 'Product Design',
    title: 'UX Content Designer',
    location: 'EMEA (Madrid)',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr_sarah'
  },
  {
    id: 'usr_thomas',
    name: 'Thomas Wright',
    email: 'thomas.wright@enterprise.com',
    role: 'Employee',
    department: 'Sales & Client Growth',
    title: 'Enterprise Account Executive',
    location: 'North America (Chicago)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    managerId: 'usr_sarah'
  }
];

export const INITIAL_CYCLES: AppraisalCycle[] = [
  {
    id: 'cyc_fy24_mid',
    name: 'FY24 Mid-Year Review',
    type: 'Mid-Year',
    year: 2024,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    status: 'Active',
    ratingScale: {
      min: 1,
      max: 5,
      labels: {
        1: 'Unsatisfactory (Needs Imp.)',
        2: 'Developing (Fair)',
        3: 'Successful (Good)',
        4: 'Superior (Great)',
        5: 'Distinguished (Elite)'
      }
    },
    weights: {
      goals: 70,
      competencies: 30
    },
    peerFeedbackEnabled: true
  },
  {
    id: 'cyc_fy24_end',
    name: 'Annual Leadership Assessment',
    type: 'End-Year',
    year: 2024,
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    status: 'Draft',
    ratingScale: {
      min: 1,
      max: 5,
      labels: {
        1: 'Needs Improvement',
        2: 'Meets Expectations',
        3: 'Exceeds Expectations',
        4: 'Outstanding',
        5: 'Role Model'
      }
    },
    weights: {
      goals: 50,
      competencies: 50
    },
    peerFeedbackEnabled: false
  },
  {
    id: 'cyc_fy23_end',
    name: 'FY23 Performance Review',
    type: 'End-Year',
    year: 2023,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'Closed',
    ratingScale: {
      min: 1,
      max: 5,
      labels: {
        1: 'Needs Improvement',
        2: 'Developing',
        3: 'Meets Standards',
        4: 'Exceeds Standards',
        5: 'Exceptional'
      }
    },
    weights: {
      goals: 70,
      competencies: 30
    },
    peerFeedbackEnabled: false
  }
];

export const INITIAL_GOALS: Goal[] = [
  // Goals for Marcus Chen (usr_marcus) in Active Cycle
  {
    id: 'goal_marcus_1',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    title: 'UX Design Delivery - Design System Migration',
    description: 'Lead the migration of legacy design systems components to standard web v2 token baseline.',
    weight: 40,
    target: 'Full migration of core web legacy components to Web Components library v2, targeting 100% adoption.',
    actual: 'Migrated 95% of components. Team adopted tokens across three core product modules successfully.',
    targetValue: 100,
    actualValue: 95,
    progress: 95,
    evidenceUrl: 'https://portfolio.company.com/design-system-v2',
    evidenceName: 'Design_System_Migration_V2_Draft.pdf',
    evidence: 'Component coverage checklist in core Figma library.',
    status: 'Approved',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-07-18T10:30:00Z',
    managerComment: 'Outstanding progress on migration.',
    lastUpdated: '2024-11-12T10:15:00Z',
    category: 'Technical'
  },
  {
    id: 'goal_marcus_2',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    title: 'Team Mentorship & Growth',
    description: 'Hold team onboarding Figma workshops and bootcamp sessions for newly hired designers.',
    weight: 30,
    target: 'Hold 4 mentor-led onboarding sessions or deep dives for new junior UX hires.',
    actual: 'Successfully delivered 5 hands-on Figma and accessibility mentorship bootcamps.',
    targetValue: 4,
    actualValue: 5,
    progress: 100,
    evidenceUrl: 'https://wiki.company.com/ux-mentorship-schedule',
    evidenceName: 'Mentorship_Curriculum_H1.xlsx',
    evidence: 'Figma boot camp calendar logs.',
    status: 'Approved',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-07-18T10:30:00Z',
    managerComment: 'Superb dedication to helping coworkers grow.',
    lastUpdated: '2024-11-12T10:15:00Z',
    category: 'People'
  },
  // Goals for Elena Rodriguez (usr_elena)
  {
    id: 'goal_elena_1',
    employeeId: 'usr_elena',
    cycleId: 'cyc_fy24_mid',
    title: 'Content Strategy Audit',
    description: 'Audit high priority payment screen transaction microcopies.',
    weight: 50,
    target: 'Audit 50 key transaction screens for micro-copy and localizations.',
    actual: 'Audited 35 screens and established a localized copywriting standard docs.',
    targetValue: 50,
    actualValue: 35,
    progress: 70,
    evidence: 'Payment screens spreadsheet log.',
    status: 'Approved',
    approvedBy: 'Sarah Johnson',
    approvedDate: '2024-07-20T11:00:00Z',
    managerComment: 'Excellent detail on localization standards.',
    lastUpdated: '2024-11-14T11:00:00Z',
    category: 'Business'
  },
  // Goals for Thomas Wright (usr_thomas)
  {
    id: 'goal_thomas_1',
    employeeId: 'usr_thomas',
    cycleId: 'cyc_fy24_mid',
    title: 'Pipeline Growth - Midwest Region',
    description: 'Grow regional sales pipelines in Midwest territory.',
    weight: 100,
    target: 'Source $500k in net-new corporate client opportunities for the enterprise suite.',
    actual: '$120k sourced, currently negotiating 2 contracts in draft state.',
    targetValue: 500000,
    actualValue: 120000,
    progress: 24,
    evidence: 'Salesforce dashboard export link.',
    status: 'Draft',
    lastUpdated: '2024-07-15T09:00:00Z',
    category: 'Business'
  }
];

export const INITIAL_APPRAISALS: Appraisal[] = [
  // Marcus Chen (usr_marcus) - FY24 Mid-Year review in SignOff stage
  {
    id: 'app_marcus_fy24',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    currentStage: 'SignOff',
    isGoalApproved: true,
    selfAppraisal: {
      strengths: 'Strong component collaboration with frontend engineering teams, delivering our design system migration on schedule. Successfully mentored new junior team designers through Figma alignment sessions.',
      opportunities: 'Need to focus more on quantifiably tracking customer experience design impact using telemetry metrics and telemetry benchmarks during key client run-throughs.',
      blockers: 'Experienced brief resource constraints in early Q3 due to engineer re-allocations on other core squads.',
      status: 'Submitted',
      submittedAt: '2024-11-12T10:15:00Z'
    },
    additionalFeedback: [],
    feedbackRequests: [],
    peerReviews: [
      {
        id: 'pr_sample_1',
        reviewerId: 'usr_elena',
        reviewerName: 'Elena Rodriguez',
        status: 'Completed',
        isSubmitted: true,
        submittedAt: '2024-11-15T16:20:00Z',
        createdAt: '2024-11-12T11:00:00Z',
        ratings: {
          collaboration: 5,
          communication: 4,
          problemSolving: 5,
          leadership: 3,
          teamwork: 5,
          accountability: 4
        },
        comments: 'Marcus is an absolute pillar of the design team. His technical knowledge of Figma tokens saved us weeks of work. He is always willing to help and explain complex concepts.',
        strengths: 'Technical Architecture in Design, Collaborative Spirit',
        areasForImprovement: 'Could delegate more of the simple component tasks to juniors.'
      }
    ],
    
    managerAppraisal: {
      ratingGoals: 4.5,
      ratingCompetencies: 4.5,
      calculatedScore: 4.5, // (4.5 * 0.70) + (4.5 * 0.30)
      justification: 'Marcus Chen has demonstrated exceptional technical and product alignment during this mid-year cycle. His specific contribution to component re-usability enabled our teams to ship frontend features at twice the speed. He sets a stellar example in visual coordination and user advocacy and his communication logic remains a foundational asset to the entire Design division. The 250+ character mandatory justification rule ensures we provide exact structural contexts here.',
      status: 'Submitted',
      submittedAt: '2024-11-18T14:30:00Z'
    },
    calibration: {
      originalCalculatedScore: 4.5,
      calibratedScore: 4.2,
      changeReason: 'Adjusted during Calibration committee review to maintain consistent alignment with historical core distribution profiles and ensure balanced score distributions globally across the Senior UX designer cohort.',
      calibratedBy: 'Chief HR Officer (Alex Sterling)',
      calibratedAt: '2024-11-22T09:00:00Z'
    },
    signOff: {
      employeeSigned: false,
      employeeReflections: 'I agree with the feedback and scores. Excellent collaboration with Sarah and the design team over this cycle.',
      managerSigned: false,
      isLocked: false
    }
  },
  // Elena Rodriguez (usr_elena) - FY24 Mid-Year review in ManagerAppraisal stage
  {
    id: 'app_elena_fy24',
    employeeId: 'usr_elena',
    cycleId: 'cyc_fy24_mid',
    currentStage: 'ManagerAppraisal',
    isGoalApproved: true,
    selfAppraisal: {
      strengths: 'Successfully completed the initial Content Strategy Audit for top tier payment screens, correcting multiple discrepancies. Drafted accessible word guidelines.',
      opportunities: 'Aiming to ramp up on usability studies to back our copywriting choices with solid quantitative surveys.',
      blockers: 'Had difficulty obtaining translation vendor credentials in early staging steps.',
      status: 'Submitted',
      submittedAt: '2024-11-14T11:00:00Z'
    },
    additionalFeedback: [
      {
        id: 'feedback_elena_1',
        senderId: 'usr_marcus',
        senderName: 'Marcus Chen',
        content: 'Elena exceeds every expectation in writing. She understands human-centered copywriting and keeps developers fully informed of visual modifications.',
        createdAt: '2024-11-14T11:00:00Z'
      }
    ],
    feedbackRequests: [],
    peerReviews: [],
    managerAppraisal: {
      justification: '',
      status: 'Draft'
    },
    calibration: {},
    signOff: {
      employeeSigned: false,
      managerSigned: false,
      isLocked: false
    }
  },
  // Marcus Thorne (usr_mthorne) - FY24 Mid-Year review in Calibration stage
  {
    id: 'app_mthorne_fy24',
    employeeId: 'usr_mthorne',
    cycleId: 'cyc_fy24_mid',
    currentStage: 'Calibration',
    isGoalApproved: true,
    selfAppraisal: {
      strengths: 'Architected the core distributed query engine expansion, supporting 10k concurrent users at less than 120ms latency.',
      opportunities: 'Need to document architectural changes extensively to prevent knowledge silos in the infrastructure squad.',
      blockers: 'Cloud pricing migrations consumed extra sprint cycles during planning.',
      status: 'Submitted',
      submittedAt: '2024-11-10T16:00:00Z'
    },
    additionalFeedback: [],
    feedbackRequests: [],
    peerReviews: [],
    managerAppraisal: {
      ratingGoals: 5.0,
      ratingCompetencies: 5.0,
      calculatedScore: 5.0,
      justification: 'Marcus Thorne has delivered industry-grade architectural leadership during this cycle. The systems he designed are performing flawlessly. His mentorship of staff engineers continues to scale our organizational capabilities exponentially.',
      status: 'Submitted',
      submittedAt: '2024-11-16T15:00:00Z'
    },
    calibration: {
      originalCalculatedScore: 5.0,
      calibratedScore: 5.0 // No adjustment yet or currently in panel
    },
    signOff: {
      employeeSigned: false,
      managerSigned: false,
      isLocked: false
    }
  },
  // Thomas Wright (usr_thomas) - FY24 Mid-Year review in GoalSetup stage
  {
    id: 'app_thomas_fy24',
    employeeId: 'usr_thomas',
    cycleId: 'cyc_fy24_mid',
    currentStage: 'GoalSetup',
    isGoalApproved: false,
    selfAppraisal: {
      strengths: '',
      opportunities: '',
      blockers: '',
      status: 'Draft'
    },
    additionalFeedback: [],
    feedbackRequests: [],
    peerReviews: [],
    managerAppraisal: {
      justification: '',
      status: 'Draft'
    },
    calibration: {},
    signOff: {
      employeeSigned: false,
      managerSigned: false,
      isLocked: false
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2024-06-03T10:00:00Z',
    cycleId: 'cyc_fy24_mid',
    actorId: 'usr_alex',
    actorName: 'Alex Sterling',
    actorRole: 'HR',
    action: 'Cycle Configured',
    details: 'Configured rating scales, goal weight (70%) and competency weight (30%) for FY24 Mid-Year cycle.'
  },
  {
    id: 'log_c_active',
    timestamp: '2024-06-03T10:05:00Z',
    cycleId: 'cyc_fy24_mid',
    actorId: 'usr_alex',
    actorName: 'Alex Sterling',
    actorRole: 'HR',
    action: 'Cycle Activated',
    details: 'Activated appraisal cycle "FY24 Mid-Year Review" corporate-wide.'
  },
  {
    id: 'log_2',
    timestamp: '2024-07-15T09:00:00Z',
    appraisalId: 'app_marcus_fy24',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    actorId: 'usr_marcus',
    actorName: 'Marcus Chen',
    actorRole: 'Employee',
    action: 'Goal Created',
    details: 'Created goals: "UX Design Delivery" and "Team Mentorship & Growth".'
  },
  {
    id: 'log_3',
    timestamp: '2024-07-18T10:30:00Z',
    appraisalId: 'app_marcus_fy24',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    actorId: 'usr_sarah',
    actorName: 'Sarah Johnson',
    actorRole: 'Manager',
    action: 'Goal Approved',
    details: 'Sarah Johnson approved the submitted performance goals for Marcus Chen.'
  },
  {
    id: 'log_4',
    timestamp: '2024-11-12T10:15:00Z',
    appraisalId: 'app_marcus_fy24',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    actorId: 'usr_marcus',
    actorName: 'Marcus Chen',
    actorRole: 'Employee',
    action: 'Self Appraisal Submitted',
    details: 'Marcus Chen submitted reflections for strengths, development opportunities, and blockers.'
  },
  {
    id: 'log_5',
    timestamp: '2024-11-15T16:20:00Z',
    appraisalId: 'app_marcus_fy24',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    actorId: 'usr_elena',
    actorName: 'Elena Rodriguez',
    actorRole: 'Employee',
    action: 'Additional Feedback Submitted',
    details: 'Submitted anonymous additional evaluation report for Marcus Chen on Collaboration.'
  },
  {
    id: 'log_6',
    timestamp: '2024-11-18T14:30:00Z',
    appraisalId: 'app_marcus_fy24',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    actorId: 'usr_sarah',
    actorName: 'Sarah Johnson',
    actorRole: 'Manager',
    action: 'Manager Score Submitted',
    details: 'Completed core review appraisal for Marcus Chen. Ratings assigned: 4.5 Goals, 4.5 Competencies.'
  },
  {
    id: 'log_7',
    timestamp: '2024-11-22T09:00:00Z',
    appraisalId: 'app_marcus_fy24',
    employeeId: 'usr_marcus',
    cycleId: 'cyc_fy24_mid',
    actorId: 'usr_alex',
    actorName: 'Alex Sterling',
    actorRole: 'HR',
    action: 'Calibration Modified',
    details: 'Adjusted Marcus Chen overall score from 4.5 to 4.2 to satisfy cohort core bell guidelines. Change logged.'
  }
];
