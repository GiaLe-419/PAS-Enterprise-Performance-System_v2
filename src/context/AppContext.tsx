import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AppraisalCycle, Goal, Appraisal, AuditLog, UserRole, FeedbackRequest, AdditionalFeedback, PeerReview } from '../types';
import { INITIAL_USERS, INITIAL_CYCLES, INITIAL_GOALS, INITIAL_APPRAISALS, INITIAL_AUDIT_LOGS } from '../data';

interface AppContextProps {
  users: User[];
  cycles: AppraisalCycle[];
  goals: Goal[];
  appraisals: Appraisal[];
  auditLogs: AuditLog[];
  currentUser: User;
  activeCycle: AppraisalCycle | null;
  // User operations
  switchUser: (userId: string) => void;
  // Goal operations
  addGoal: (goal: Omit<Goal, 'id' | 'status' | 'lastUpdated'>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  submitGoal: (goalId: string) => void;
  submitGoalsBatch: (employeeId: string, cycleId: string) => void;
  approveGoal: (goalId: string, comment: string) => void;
  requestRevisionGoal: (goalId: string, comment: string) => void;
  rejectGoal: (goalId: string, comment: string) => void;
  approveGoals: (employeeId: string, cycleId: string, comment?: string, action?: 'approve' | 'revision' | 'reject') => void;
  // Self Appraisal
  saveSelfAppraisal: (appraisalId: string, strengths: string, opportunities: string, blockers: string, isSubmit: boolean) => void;
  // Peer Feedback (Structured)
  submitPeerFeedback: (
    appraisalId: string,
    reviewerId: string,
    ratings: {
      collaboration: number;
      communication: number;
      problemSolving: number;
      leadership: number;
      teamwork: number;
      accountability: number;
    },
    comments: string,
    strengths: string,
    areasForImprovement: string
  ) => void;
  requestPeerFeedback: (appraisalId: string, employeeIds: string[]) => void;
  cancelPeerReviewRequest: (appraisalId: string, peerReviewId: string) => void;
  expirePeerReviewRequest: (appraisalId: string, peerReviewId: string) => void;
  // Sign off
  signOffEmployee: (appraisalId: string, reflections: string, rebuttal: string) => void;
  signOffManager: (appraisalId: string, finalComments: string) => void;
  requestAdditionalFeedback: (appraisalId: string, employeeIds: string[]) => void;
  submitAdditionalFeedback: (appraisalId: string, content: string) => void;
  // Cycle Management
  createCycle: (cycle: Omit<AppraisalCycle, 'id' | 'status'>) => void;
  updateCycleStatus: (cycleId: string, status: 'Draft' | 'Active' | 'Closed') => void;
  togglePeerFeedbackEnabled: (cycleId: string) => void;
  // HR Override
  overrideAppraisal: (appraisalId: string, newStage: Appraisal['currentStage']) => void;
  resetAllData: () => void;
  // Auth operations
  loginType: 'Authenticated' | 'Sandbox' | null;
  loginUsername: string | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  enterSandbox: () => void;
  logout: () => void;
}

export interface PeerReviewDraft {
  reviewerId: string;
  reviewerName: string;
  ratings: {
    collaboration: number;
    communication: number;
    problemSolving: number;
    leadership: number;
  };
  comments: string;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pas_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [cycles, setCycles] = useState<AppraisalCycle[]>(() => {
    const saved = localStorage.getItem('pas_cycles');
    return saved ? JSON.parse(saved) : INITIAL_CYCLES;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('pas_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [appraisals, setAppraisals] = useState<Appraisal[]>(() => {
    const saved = localStorage.getItem('pas_appraisals');
    return saved ? JSON.parse(saved) : INITIAL_APPRAISALS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('pas_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('pas_current_user_id') || 'usr_alex'; // Default to HR Alex Sterling first to configure/see everything easily
  });

  const [loginType, setLoginType] = useState<'Authenticated' | 'Sandbox' | null>(() => {
    return localStorage.getItem('pas_login_type') as 'Authenticated' | 'Sandbox' | null;
  });

  const [loginUsername, setLoginUsername] = useState<string | null>(() => {
    return localStorage.getItem('pas_login_username') || null;
  });

  const login = (username: string, password: string) => {
    const u = username.toLowerCase().trim();
    const p = password;

    let targetUserId = '';
    let targetRole: UserRole = 'Employee';

    if (u === 'employee' && p === 'employee123') {
      targetUserId = 'usr_marcus';
      targetRole = 'Employee';
    } else if (u === 'manager' && p === 'manager123') {
      targetUserId = 'usr_sarah';
      targetRole = 'Manager';
    } else if (u === 'hr' && p === 'hr123') {
      targetUserId = 'usr_alex';
      targetRole = 'HR';
    } else if (u === 'leader' && p === 'leader123') {
      targetUserId = 'usr_jane';
      targetRole = 'SeniorManager';
    } else {
      return { success: false, error: 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại!' };
    }

    setLoginType('Authenticated');
    setLoginUsername(username);
    setCurrentUserId(targetUserId);

    localStorage.setItem('pas_login_type', 'Authenticated');
    localStorage.setItem('pas_login_username', username);
    localStorage.setItem('pas_role', targetRole);
    localStorage.setItem('pas_current_user_id', targetUserId);

    return { success: true };
  };

  const enterSandbox = () => {
    setLoginType('Sandbox');
    setLoginUsername('sandbox_user');
    setCurrentUserId('usr_alex'); // Default sandbox user to CHRO Alex Sterling

    localStorage.setItem('pas_login_type', 'Sandbox');
    localStorage.setItem('pas_login_username', 'sandbox_user');
    localStorage.setItem('pas_role', 'HR');
    localStorage.setItem('pas_current_user_id', 'usr_alex');
  };

  const logout = () => {
    setLoginType(null);
    setLoginUsername(null);
    setCurrentUserId('usr_alex');

    localStorage.removeItem('pas_login_type');
    localStorage.removeItem('pas_login_username');
    localStorage.removeItem('pas_role');
    localStorage.removeItem('pas_current_user_id');
  };

  const dbUser = users.find(u => u.id === currentUserId) || users[0];
  const activeCycle = cycles.find(c => c.status === 'Active') || null;

  const currentUser = React.useMemo(() => {
    return dbUser;
  }, [dbUser]);

  // Persist to localStorage whenever states change
  useEffect(() => {
    localStorage.setItem('pas_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pas_cycles', JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem('pas_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('pas_appraisals', JSON.stringify(appraisals));
  }, [appraisals]);

  useEffect(() => {
    localStorage.setItem('pas_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('pas_current_user_id', currentUserId);
  }, [currentUserId]);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const addLog = (action: string, details: string, appraisalId?: string, employeeId?: string, cycleId?: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      details,
      appraisalId,
      employeeId,
      cycleId
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to ensure an appraisal record exists for employee/cycle
  const getOrCreateAppraisal = (employeeId: string, cycleId: string): Appraisal => {
    const existing = appraisals.find(a => a.employeeId === employeeId && a.cycleId === cycleId);
    if (existing) return existing;

    const newAppraisal: Appraisal = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      employeeId,
      cycleId,
      currentStage: 'GoalSetup',
      isGoalApproved: false,
      selfAppraisal: { strengths: '', opportunities: '', blockers: '', status: 'Draft' },
      feedbackRequests: [],
      additionalFeedback: [],
      peerReviews: [],
      managerAppraisal: { justification: '', status: 'Draft' },
      calibration: {},
      signOff: { employeeSigned: false, managerSigned: false, isLocked: false }
    };

    setAppraisals(prev => [...prev, newAppraisal]);
    return newAppraisal;
  };

  // Peer Feedback Operations
  const requestPeerFeedback = (appraisalId: string, employeeIds: string[]) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const newReviews: PeerReview[] = employeeIds.map(eid => {
          const u = users.find(user => user.id === eid);
          return {
            id: `pr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            reviewerId: eid,
            reviewerName: u?.name || 'Unknown',
            reviewerEmail: u?.email || '',
            status: 'Requested',
            isSubmitted: false,
            createdAt: new Date().toISOString()
          };
        });
        return {
          ...a,
          peerReviews: [...(a.peerReviews || []), ...newReviews]
        };
      }
      return a;
    }));
    addLog('Peer Review Requested', `Manager requested structured peer review for appraisal ${appraisalId}`, appraisalId);
  };

  const submitPeerFeedback = (
    appraisalId: string,
    reviewerId: string,
    ratings: {
      collaboration: number;
      communication: number;
      problemSolving: number;
      leadership: number;
      teamwork: number;
      accountability: number;
    },
    comments: string,
    strengths: string,
    areasForImprovement: string
  ) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const updatedReviews = (a.peerReviews || []).map(pr => {
          if (pr.reviewerId === reviewerId && pr.status !== 'Completed') {
            return {
              ...pr,
              ratings,
              comments,
              strengths,
              areasForImprovement,
              status: 'Completed' as const,
              isSubmitted: true,
              submittedAt: new Date().toISOString()
            };
          }
          return pr;
        });
        return { ...a, peerReviews: updatedReviews };
      }
      return a;
    }));
    addLog('Peer Feedback Submitted', 'Colleague submitted structured peer evaluation.', appraisalId);
  };

  const cancelPeerReviewRequest = (appraisalId: string, peerReviewId: string) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const updatedReviews = (a.peerReviews || []).map(pr => 
          pr.id === peerReviewId ? { ...pr, status: 'Cancelled' as const } : pr
        );
        return { ...a, peerReviews: updatedReviews };
      }
      return a;
    }));
  };

  const expirePeerReviewRequest = (appraisalId: string, peerReviewId: string) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const updatedReviews = (a.peerReviews || []).map(pr => 
          pr.id === peerReviewId ? { ...pr, status: 'Expired' as const } : pr
        );
        return { ...a, peerReviews: updatedReviews };
      }
      return a;
    }));
  };

  // Helper to synchronize appraisal stages and lock status based on goals list
  const syncAppraisalsForGoals = (employeeId: string, cycleId: string, updatedGoals: Goal[]) => {
    const userGoals = updatedGoals.filter(g => g.employeeId === employeeId && g.cycleId === cycleId);
    const hasGoals = userGoals.length > 0;
    const allApproved = hasGoals && userGoals.every(g => g.status === 'Approved');

    setAppraisals(prevAppraisals => prevAppraisals.map(a => {
      if (a.employeeId === employeeId && a.cycleId === cycleId) {
        let nextStage = a.currentStage;
        if (allApproved && a.currentStage === 'GoalSetup') {
          nextStage = 'SelfAppraisal';
        } else if (!allApproved && a.currentStage === 'SelfAppraisal') {
          nextStage = 'GoalSetup';
        }
        return {
          ...a,
          isGoalApproved: allApproved,
          currentStage: nextStage
        };
      }
      return a;
    }));
  };

  // Goals operations
  const addGoal = (goalData: Omit<Goal, 'id' | 'status' | 'lastUpdated'>) => {
    const timestamp = new Date().toISOString();
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      status: 'Draft',
      lastUpdated: timestamp
    };
    
    setGoals(prev => {
      const next = [...prev, newGoal];
      setTimeout(() => syncAppraisalsForGoals(goalData.employeeId, goalData.cycleId, next), 0);
      return next;
    });

    getOrCreateAppraisal(goalData.employeeId, goalData.cycleId);
    
    addLog(
      'Goal Created',
      `Previous Status: N/A, New Status: Draft. Objective title: "${goalData.title}", weight: ${goalData.weight}%.`,
      undefined,
      goalData.employeeId,
      goalData.cycleId
    );
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    let prevStatus = '';
    let newStatus = '';
    let employeeId = '';
    let cycleId = '';
    let title = '';

    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id === goalId) {
          prevStatus = g.status;
          employeeId = g.employeeId;
          cycleId = g.cycleId;
          title = g.title;
          const nextStatus = updates.status !== undefined ? updates.status : g.status;
          newStatus = nextStatus;
          return { 
            ...g, 
            ...updates, 
            lastUpdated: new Date().toISOString() 
          };
        }
        return g;
      });

      if (employeeId && cycleId) {
        setTimeout(() => syncAppraisalsForGoals(employeeId, cycleId, next), 0);
      }
      return next;
    });

    if (employeeId) {
      addLog(
        'Goal Updated',
        `Previous Status: ${prevStatus}, New Status: ${newStatus || prevStatus}. Updated details for "${title}".`,
        undefined,
        employeeId,
        cycleId
      );
    }
  };

  const deleteGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setGoals(prev => {
        const next = prev.filter(g => g.id !== goalId);
        setTimeout(() => syncAppraisalsForGoals(goal.employeeId, goal.cycleId, next), 0);
        return next;
      });

      addLog(
        'Goal Deleted',
        `Previous Status: ${goal.status}, New Status: N/A. Deleted performance objective: "${goal.title}"`,
        undefined,
        goal.employeeId,
        goal.cycleId
      );
    }
  };

  const submitGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            status: 'Pending Approval',
            submittedDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };
        }
        return g;
      });
      setTimeout(() => syncAppraisalsForGoals(goal.employeeId, goal.cycleId, next), 0);
      return next;
    });

    addLog(
      'Goal Submitted',
      `Previous Status: ${goal.status}, New Status: Pending Approval. Submitted objective "${goal.title}" for manager approval.`,
      undefined,
      goal.employeeId,
      goal.cycleId
    );
  };

  const submitGoalsBatch = (employeeId: string, cycleId: string) => {
    setGoals(prev => {
      const next = prev.map(g => {
        if (g.employeeId === employeeId && g.cycleId === cycleId && (g.status === 'Draft' || g.status === 'Revision Required')) {
          return {
            ...g,
            status: 'Pending Approval',
            submittedDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };
        }
        return g;
      });
      setTimeout(() => syncAppraisalsForGoals(employeeId, cycleId, next), 0);
      return next;
    });

    addLog(
      'Goals Batch Submitted',
      `Submitted all draft and revision-required performance objectives as a batch for manager approval.`,
      undefined,
      employeeId,
      cycleId
    );
  };

  const approveGoal = (goalId: string, comment: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            status: 'Approved',
            approvedBy: currentUser.name,
            approvedDate: new Date().toISOString(),
            managerComment: comment,
            lastUpdated: new Date().toISOString()
          };
        }
        return g;
      });
      setTimeout(() => syncAppraisalsForGoals(goal.employeeId, goal.cycleId, next), 0);
      return next;
    });

    addLog(
      'Goal Approved',
      `Previous Status: ${goal.status}, New Status: Approved. Approved by ${currentUser.name}. Comment: "${comment}"`,
      undefined,
      goal.employeeId,
      goal.cycleId
    );
  };

  const requestRevisionGoal = (goalId: string, comment: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            status: 'Revision Required',
            managerComment: comment,
            lastUpdated: new Date().toISOString()
          };
        }
        return g;
      });
      setTimeout(() => syncAppraisalsForGoals(goal.employeeId, goal.cycleId, next), 0);
      return next;
    });

    addLog(
      'Goal Revision Requested',
      `Previous Status: ${goal.status}, New Status: Revision Required. Requested by manager. Comment: "${comment}"`,
      undefined,
      goal.employeeId,
      goal.cycleId
    );
  };

  const rejectGoal = (goalId: string, comment: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            status: 'Rejected',
            managerComment: comment,
            lastUpdated: new Date().toISOString()
          };
        }
        return g;
      });
      setTimeout(() => syncAppraisalsForGoals(goal.employeeId, goal.cycleId, next), 0);
      return next;
    });

    addLog(
      'Goal Rejected',
      `Previous Status: ${goal.status}, New Status: Rejected. Rejected by manager. Comment: "${comment}"`,
      undefined,
      goal.employeeId,
      goal.cycleId
    );
  };

  const approveGoals = (employeeId: string, cycleId: string, comment?: string, action: 'approve' | 'revision' | 'reject' = 'approve') => {
    setGoals(prev => {
      const next = prev.map(g => {
        if (g.employeeId === employeeId && g.cycleId === cycleId && g.status === 'Pending Approval') {
          if (action === 'approve') {
            return {
              ...g,
              status: 'Approved' as const,
              approvedBy: currentUser.name,
              approvedDate: new Date().toISOString(),
              managerComment: comment?.trim() || 'Batch approved by manager.',
              lastUpdated: new Date().toISOString()
            };
          } else if (action === 'revision') {
            return {
              ...g,
              status: 'Revision Required' as const,
              managerComment: comment?.trim() || 'Revision requested for goals batch.',
              lastUpdated: new Date().toISOString()
            };
          } else {
            return {
              ...g,
              status: 'Rejected' as const,
              managerComment: comment?.trim() || 'Rejected goals batch.',
              lastUpdated: new Date().toISOString()
            };
          }
        }
        return g;
      });
      setTimeout(() => syncAppraisalsForGoals(employeeId, cycleId, next), 0);
      return next;
    });

    const actionText = action === 'approve' ? 'Approved' : action === 'revision' ? 'Revision Required' : 'Rejected';
    addLog(
      `Goals Batch ${actionText}`,
      `Manager reviewed goals as a batch with decision: ${actionText}. Comment: "${comment || 'No comment provided'}"`,
      undefined,
      employeeId,
      cycleId
    );
  };

  // Self Appraisal
  const saveSelfAppraisal = (appraisalId: string, strengths: string, opportunities: string, blockers: string, isSubmit: boolean) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const nextStage: Appraisal['currentStage'] = isSubmit 
          ? 'ManagerAppraisal'
          : a.currentStage;

        return {
          ...a,
          currentStage: nextStage,
          selfAppraisal: {
            strengths,
            opportunities,
            blockers,
            status: isSubmit ? 'Submitted' : 'Draft',
            submittedAt: isSubmit ? new Date().toISOString() : undefined
          }
        };
      }
      return a;
    }));

    const app = appraisals.find(a => a.id === appraisalId);
    if (app) {
      if (isSubmit) {
        addLog('Self Appraisal Submitted', 'Employee submitted self-appraisal form for review.', appraisalId, app.employeeId, app.cycleId);
      } else {
        addLog('Self Appraisal Saved', 'Employee saved a draft copy of self-appraisal.', appraisalId, app.employeeId, app.cycleId);
      }
    }
  };

  // Additional Feedback
  const requestAdditionalFeedback = (appraisalId: string, employeeIds: string[]) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const newRequests: FeedbackRequest[] = employeeIds.map(eid => {
          const u = users.find(user => user.id === eid);
          return {
            id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            reviewerId: eid,
            reviewerName: u?.name || 'Unknown',
            status: 'Pending',
            createdAt: new Date().toISOString()
          };
        });
        return {
          ...a,
          feedbackRequests: [...(a.feedbackRequests || []), ...newRequests]
        };
      }
      return a;
    }));
    addLog('Feedback Requested', `Manager requested feedback for appraisal ${appraisalId}`, appraisalId);
  };

  const submitAdditionalFeedback = (appraisalId: string, content: string) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const newFeedback: AdditionalFeedback = {
          id: `fb_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          content,
          createdAt: new Date().toISOString()
        };
        const updatedRequests = (a.feedbackRequests || []).map(req => 
          req.reviewerId === currentUser.id ? { ...req, status: 'Completed' as const } : req
        );
        return {
          ...a,
          additionalFeedback: [...(a.additionalFeedback || []), newFeedback],
          feedbackRequests: updatedRequests
        };
      }
      return a;
    }));
    addLog('Feedback Submitted', 'Employee submitted additional feedback.', appraisalId);
  };

  // Manager Appraisal
  const saveManagerAppraisal = (
    appraisalId: string, 
    ratingGoals: number, 
    ratingComp: number, 
    justification: string, 
    isSubmit: boolean,
    inflationAck?: boolean
  ) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const score = parseFloat(((ratingGoals * 0.7) + (ratingComp * 0.3)).toFixed(2));
        const nextStage: Appraisal['currentStage'] = isSubmit ? 'Calibration' : a.currentStage;
        return {
          ...a,
          currentStage: nextStage,
          managerAppraisal: {
            ratingGoals,
            ratingCompetencies: ratingComp,
            calculatedScore: score,
            justification,
            inflationAcknowledged: inflationAck,
            status: isSubmit ? 'Submitted' : 'Draft',
            submittedAt: isSubmit ? new Date().toISOString() : undefined
          }
        };
      }
      return a;
    }));

    const app = appraisals.find(a => a.id === appraisalId);
    if (app) {
      if (isSubmit) {
        addLog('Manager Appraisal Submitted', `Manager submitted final appraisal evaluation. Calculated Score: ${((ratingGoals*0.7)+(ratingComp*0.3)).toFixed(2)}/5.0`, appraisalId, app.employeeId, app.cycleId);
      } else {
        addLog('Manager Appraisal Draft Saved', 'Manager saved a draft copy of employee evaluation.', appraisalId, app.employeeId, app.cycleId);
      }
    }
  };

  // Calibration
  const calibrateAppraisal = (appraisalId: string, calibratedScore: number, changeReason: string, isSubmit: boolean = true) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const original = a.calibration.originalCalculatedScore !== undefined && a.calibration.originalCalculatedScore !== 0
          ? a.calibration.originalCalculatedScore 
          : (a.managerAppraisal.calculatedScore || 0);
        return {
          ...a,
          currentStage: isSubmit ? 'SignOff' : a.currentStage,
          calibration: {
            ...a.calibration,
            originalCalculatedScore: original,
            calibratedScore,
            changeReason,
            calibratedBy: `${currentUser.name} (${currentUser.role})`,
            calibratedAt: new Date().toISOString(),
            isSubmitted: isSubmit,
            submittedAt: isSubmit ? new Date().toISOString() : undefined
          }
        };
      }
      return a;
    }));

    const app = appraisals.find(a => a.id === appraisalId);
    if (app) {
      const orig = app.calibration.originalCalculatedScore || app.managerAppraisal.calculatedScore || 0;
      if (isSubmit) {
        addLog('Calibration Submitted', `HR finalized and submitted performance calibration for ${users.find(u => u.id === app.employeeId)?.name}: Rating ${orig} → ${calibratedScore}. Reason: ${changeReason}`, appraisalId, app.employeeId, app.cycleId);
      } else {
        addLog('Calibration Saved as Draft', `HR updated calibration draft for ${users.find(u => u.id === app.employeeId)?.name}: Rating ${orig} → ${calibratedScore}. Reason: ${changeReason}`, appraisalId, app.employeeId, app.cycleId);
      }
    }
  };

  // Sign off
  const signOffEmployee = (appraisalId: string, reflections: string, rebuttal: string) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        return {
          ...a,
          signOff: {
            ...a.signOff,
            employeeSigned: true,
            employeeSignedAt: new Date().toISOString(),
            employeeReflections: reflections,
            employeeRebuttal: rebuttal
          }
        };
      }
      return a;
    }));

    const app = appraisals.find(a => a.id === appraisalId);
    if (app) {
      addLog('Self Digital Signature Completed', 'Employee digitally signed off the final performance review form.', appraisalId, app.employeeId, app.cycleId);
    }
  };

  const signOffManager = (appraisalId: string, finalComments: string) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        return {
          ...a,
          currentStage: 'Completed',
          signOff: {
            ...a.signOff,
            managerSigned: true,
            managerSignedAt: new Date().toISOString(),
            managerFinalComments: finalComments,
            isLocked: true // Read-only mark!
          }
        };
      }
      return a;
    }));

    const app = appraisals.find(a => a.id === appraisalId);
    if (app) {
      addLog('Manager Final Signature Completed', 'Direct Manager signed off the final performance record. Record marked as sealed and archived.', appraisalId, app.employeeId, app.cycleId);
    }
  };

  // Cycle Management
  const createCycle = (cycleData: Omit<AppraisalCycle, 'id' | 'status'>) => {
    const newCycle: AppraisalCycle = {
      ...cycleData,
      id: `cyc_${Date.now()}`,
      status: 'Draft'
    };
    setCycles(prev => [...prev, newCycle]);
    addLog('Cycle Created', `Created a new review cycle template: ${cycleData.name}`);
  };

  const updateCycleStatus = (cycleId: string, status: 'Draft' | 'Active' | 'Closed') => {
    setCycles(prev => prev.map(c => {
      // If activating a cycle, deactivate other active ones to respect organizational constraints
      if (status === 'Active') {
        if (c.id === cycleId) return { ...c, status };
        if (c.status === 'Active') return { ...c, status: 'Closed' as const };
        return c;
      }
      return c.id === cycleId ? { ...c, status } : c;
    }));

    const cycle = cycles.find(c => c.id === cycleId);
    if (cycle) {
      addLog(`Cycle Status changed to ${status}`, `Appraisal cycle "${cycle.name}" is now marked as ${status}.`, undefined, undefined, cycleId);
    }
  };

  const togglePeerFeedbackEnabled = (cycleId: string) => {
    setCycles(prev => prev.map(c => {
      if (c.id === cycleId) {
        const nextVal = !c.peerFeedbackEnabled;
        addLog(`Cycle Peer Feedback Toggle`, `Peer feedback is now ${nextVal ? 'enabled' : 'disabled'} for cycle: ${c.name}`);
        return { ...c, peerFeedbackEnabled: nextVal };
      }
      return c;
    }));
  };

  // HR Override to unlock
  const overrideAppraisal = (appraisalId: string, newStage: Appraisal['currentStage']) => {
    setAppraisals(prev => prev.map(a => {
      if (a.id === appraisalId) {
        const updatedCalibration = { ...a.calibration };
        if (newStage === 'Calibration') {
          updatedCalibration.isSubmitted = false;
        }
        return {
          ...a,
          currentStage: newStage,
          calibration: updatedCalibration,
          signOff: {
            ...a.signOff,
            employeeSigned: false, // Reset signature logs to re-do sequence
            managerSigned: false,
            isLocked: false
          }
        };
      }
      return a;
    }));

    const app = appraisals.find(a => a.id === appraisalId);
    if (app) {
      addLog('HR Override Completed', `HR unlocked this appraisal. Stage reset back to "${newStage}" to allow adjustments.`, appraisalId, app.employeeId, app.cycleId);
    }
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCycles(INITIAL_CYCLES);
    setGoals(INITIAL_GOALS);
    setAppraisals(INITIAL_APPRAISALS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserId('usr_alex');
    setLoginType(null);
    setLoginUsername(null);
    localStorage.clear();
    addLog('System Reset', 'Restored all original sample enterprise records, parameters, and audit trails to factory default.');
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      users,
      cycles,
      goals,
      appraisals,
      auditLogs,
      currentUser,
      activeCycle,
      switchUser,
      addGoal,
      updateGoal,
      deleteGoal,
      submitGoal,
      submitGoalsBatch,
      approveGoal,
      requestRevisionGoal,
      rejectGoal,
      approveGoals,
      saveSelfAppraisal,
      saveManagerAppraisal,
      calibrateAppraisal,
      signOffEmployee,
      signOffManager,
      submitPeerFeedback,
      requestPeerFeedback,
      cancelPeerReviewRequest,
      expirePeerReviewRequest,
      requestAdditionalFeedback,
      submitAdditionalFeedback,
      createCycle,
      updateCycleStatus,
      togglePeerFeedbackEnabled,
      overrideAppraisal,
      resetAllData,
      loginType,
      loginUsername,
      login,
      enterSandbox,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
