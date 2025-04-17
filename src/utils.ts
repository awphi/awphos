export function removeFromArray<T>(arr: T[], item: T): boolean {
  const idx = arr.indexOf(item);
  if (idx !== -1) {
    arr.splice(idx, 1);
    return true;
  }

  return false;
}

export function getFocusTargetId(applicationId: string): string {
  return `focus_application_target:${applicationId}`;
}
