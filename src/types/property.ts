export interface AssignmentHistory {
  agentId: string;
  assignedAt: string;
  assignedBy: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  assignedAgentId: string | null;
  assignmentHistory: AssignmentHistory[];
}

export interface AssignAgentPayload {
  agentId: string;
}