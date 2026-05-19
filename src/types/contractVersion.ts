export interface ContractVersionResponse {
  id: string;
  operationId: string;
  versionNumber: number;
  content: string;
  title: string;
  changeDescription: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  status: string;
}

export interface CreateContractVersionRequest {
  content: string;
  title: string;
  changeDescription: string;
}
