// enums.ts

export const ProjectRole = {
  OWNER: 'OWNER',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const;

export type ProjectRole = keyof typeof ProjectRole;
