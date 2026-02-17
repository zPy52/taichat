import { readFile, writeFile, removeFile, listDirectory } from '@/tools/file-tools';
import { executeCommand } from '@/tools/shell-tool';
import { searchWeb } from '@/tools/web-search';

export const allTools = {
  read_file: readFile,
  write_file: writeFile,
  remove_file: removeFile,
  list_directory: listDirectory,
  execute_command: executeCommand,
  search_web: searchWeb,
};

export const SAFE_TOOLS = new Set(['read_file', 'list_directory', 'search_web']);

export const DANGEROUS_TOOLS = new Set(['write_file', 'remove_file', 'execute_command']);

export function isDangerousTool(toolName: string): boolean {
  return DANGEROUS_TOOLS.has(toolName);
}
