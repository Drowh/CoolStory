export interface Chat {
  id: number;
  title: string;
  lastMessage: string;
  isActive: boolean;
  hidden: boolean;
  folderId?: number;
}

export interface Folder {
  id: number;
  name: string;
}

export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
}

export interface ChatGroups {
  today: Chat[];
  older: Chat[];
}
