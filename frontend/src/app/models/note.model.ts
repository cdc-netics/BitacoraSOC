export interface AdminNote {
  _id: string;
  content: string;
  lastEditedBy?: string;
  lastEditedByUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalNote {
  _id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNoteRequest {
  content: string;
}
