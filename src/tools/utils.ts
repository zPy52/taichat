import path from 'node:path';
import { truncate } from '@/utils/string';

export class SubmoduleToolsUtils {
  public hasSameArgs(
    previousArgs?: Record<string, unknown>,
    nextArgs?: Record<string, unknown>,
  ): boolean {
    if (previousArgs === nextArgs) {
      return true;
    }

    if (!previousArgs || !nextArgs) {
      return !previousArgs && !nextArgs;
    }

    const previousKeys = Object.keys(previousArgs);
    const nextKeys = Object.keys(nextArgs);
    if (previousKeys.length !== nextKeys.length) {
      return false;
    }

    return previousKeys.every((key) => previousArgs[key] === nextArgs[key]);
  }

  public toVerb(toolName?: string): { pending: string; completed: string } {
    switch (toolName) {
      case 'read_file':
        return { pending: 'Reading', completed: 'Read' };
      case 'write_file':
        return { pending: 'Writing', completed: 'Wrote' };
      case 'remove_file':
        return { pending: 'Removing', completed: 'Removed' };
      case 'list_directory':
        return { pending: 'Listing', completed: 'Listed' };
      case 'execute_command':
        return { pending: 'Executing', completed: 'Executed' };
      case 'search_web':
        return { pending: 'Searching', completed: 'Searched' };
      default:
        return { pending: 'Running', completed: 'Ran' };
    }
  }

  public toObject(toolName?: string, toolArgs?: Record<string, unknown>): string {
    switch (toolName) {
      case 'read_file':
      case 'write_file':
      case 'remove_file':
        return `file ${this.toPathLabel(this.getStringArg(toolArgs, 'filePath'))}`;
      case 'list_directory':
        return `directory ${this.toPathLabel(this.getStringArg(toolArgs, 'dirPath', '.'))}`;
      case 'execute_command':
        return this.toCommandLabel(this.getStringArg(toolArgs, 'command'));
      case 'search_web':
        return `web for ${this.toQuotedValue(this.getStringArg(toolArgs, 'query'), 60)}`.trim();
      default:
        return toolName ? `tool ${toolName}` : 'tool';
    }
  }

  public formatArgs(args?: Record<string, unknown>): string {
    if (!args) {
      return '';
    }

    const entries = Object.entries(args);
    if (entries.length === 0) {
      return '';
    }

    return entries
      .map(([key, value]) => {
        const textValue = typeof value === 'string' ? truncate(value, 60) : JSON.stringify(value);
        return `${key}=${textValue}`;
      })
      .join(' ');
  }

  public getPendingText(toolName?: string, toolArgs?: Record<string, unknown>): string {
    const verb = this.toVerb(toolName);
    const object = this.toObject(toolName, toolArgs);
    return `${verb.pending} ${object}...`;
  }

  public getCompletedText(toolName?: string, toolArgs?: Record<string, unknown>): string {
    const verb = this.toVerb(toolName);
    const object = this.toObject(toolName, toolArgs);
    return `${verb.completed} ${object}`;
  }

  public hasResultError(content: string): boolean {
    if (!content) {
      return false;
    }
    if (content.startsWith('Error:') || content === 'Tool call denied.') {
      return true;
    }
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      return typeof parsed.error === 'string' && parsed.error.length > 0;
    } catch {
      return false;
    }
  }

  private getStringArg(args: Record<string, unknown> | undefined, key: string, fallback = ''): string {
    const value = args?.[key];
    return typeof value === 'string' && value.length > 0 ? value : fallback;
  }

  private toPathLabel(rawPath: string): string {
    if (!rawPath) {
      return 'file';
    }
    const baseName = path.basename(rawPath.trim());
    return baseName || rawPath;
  }

  private toQuotedValue(value: string, maxLength: number): string {
    const text = value.trim();
    if (!text) {
      return '';
    }
    return `"${truncate(text, maxLength)}"`;
  }

  private toCommandLabel(command: string): string {
    const trimmed = command.trim();
    if (!trimmed) {
      return 'command';
    }
    const firstToken = trimmed.split(/\s+/)[0];
    if (firstToken === 'rg' || firstToken === 'grep') {
      return 'search command';
    }
    return `command ${this.toQuotedValue(trimmed, 60)}`.trim();
  }
}
