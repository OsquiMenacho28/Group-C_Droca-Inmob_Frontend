export interface AgentRankingItem {
  position: number;
  agentId: string;
  agentName: string;
  closedSales: number;
  percentageOfTotal: number;
}

export interface AgentRankingFilters {
  startDate: string;
  endDate: string;
  department?: string;
}

export interface AgentRankingData {
  ranking: AgentRankingItem[];
  totalClosedSales: number;
  filters: AgentRankingFilters;
}
