export interface Chat {
  id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive: boolean;
  hidden: boolean;
  isFavorite: boolean;
}

export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface ChatGroups {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
}
