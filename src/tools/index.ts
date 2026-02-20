import { SubmoduleToolsUtils } from '@/tools/utils';
import { SubmoduleToolsWeb } from '@/tools/web-search';
import { SubmoduleToolsShell } from '@/tools/shell-tool';
import { SubmoduleToolsFiles } from '@/tools/file-tools';

export class Tools {
  public static readonly web = new SubmoduleToolsWeb();
  public static readonly files = new SubmoduleToolsFiles();
  public static readonly shell = new SubmoduleToolsShell();
  public static readonly utils = new SubmoduleToolsUtils();

  public static allTools() {
    return {
      read_file: Tools.files.read(),
      write_file: Tools.files.write(),
      remove_file: Tools.files.remove(),
      list_directory: Tools.files.list(),
      execute_command: Tools.shell.execute(),
      search_web: Tools.web.search(),
    };
  }
}
