export interface Chat {
  id: number;
  title: string;
  lastMessage: string;
  isActive: boolean;
  hidden: boolean;
  folderId?: number;
  createdAt?: Date;
}

export interface Folder {
  id: number;
  name: string;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  imageUrl?: string;
}

export interface ChatGroups {
  today: Chat[];
  older: Chat[];
}
