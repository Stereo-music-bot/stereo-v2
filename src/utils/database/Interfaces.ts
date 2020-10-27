export interface rolePermissions {
  roleId: string,
  permissions: {
    ADD_SONGS?: boolean,
    MANAGE_QUEUE?: boolean,
    MANAGE_PLAYER?: boolean
  }
};

export interface guildConfig {
  guildId: string
  prefix: string,
  announce: boolean,
  partner: boolean,
  rolePermissions: Array<rolePermissions>,
  ignoredChannels: Array<string>,
};