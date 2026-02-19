export interface SlashCommand {
  command: string;
  description: string;
}

export interface ChatInputProps {
  onSubmit: (text: string) => void;
  onSlashCommand: (command: string) => void;
  isActive: boolean;
  history: string[];
}

export interface UseInputHistoryOptions {
  history: string[];
  isActive: boolean;
  onSubmit: (text: string) => void;
  onSlashCommand: (command: string) => void;
}

export interface UseInputHistoryResult {
  inputKey: number;
  defaultValue: string | undefined;
  handleSubmit: (text: string) => void;
}
