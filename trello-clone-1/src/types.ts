export type projectDetailsType = {
  id: string;
  title: string;
  columns: columnDetailsType[];
};

export type columnDetailsType = {
  id: string;
  title: string;
  cards: cardDetailsType[];
};

export type cardDetailsType = {
  id: string;
  title: string;
};

export type userDataType = {
  email: string;
  password: string;
  name: string;
  position: string;
  projects: projectDetailsType[];
};

export type dbType = {
  users: userDataType[];
};
