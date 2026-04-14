export interface LakeshoreConfig {
  /** Base URL of the Lakeshore tunnel endpoint, e.g. https://my-tunnel.ngrok.io */
  url: string;
  /** Optional Bearer token required by the on-premises server */
  key?: string;
  /** Optional human-readable label shown in the Settings UI */
  label?: string;
}

export interface Settings {
  theme: Theme;
  hiddenModelIds: string[];
  featureOptions: { [key: string]: boolean };
  chatColorPalette?: string;
  avatarColorTone?: 'userPrimary' | 'userSecondary' | 'assistantPrimary' | 'assistantSecondary';
  /** Personal on-premises (Lakeshore) endpoint configured by the user */
  lakeshoreConfig?: LakeshoreConfig;
}


export type Theme = 'light' | 'dark';



