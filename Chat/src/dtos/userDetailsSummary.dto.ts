export type UserDetailsSummaryDTO = {
  _id: string;
  username: string;
  avatar?: string;
};

export type UserBulkResponse = {
  users: UserDetailsSummaryDTO[];
};