export interface rolePermissions {
  roleId: string,
  permissions: 'MANAGE_PLAYER' | 'MANAGE_QUEUE' | 'ADD_SONGS' | 'ALL'
};

export interface guildConfig {
  guildId: string
  prefix: string,
  announce: boolean,
  partner: boolean,
  rolePermissions: Array<rolePermissions>,
  ignoredChannels: Array<string>,
};