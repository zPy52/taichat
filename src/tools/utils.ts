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
}