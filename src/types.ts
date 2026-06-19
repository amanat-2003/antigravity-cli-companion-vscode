export interface ContextChip {
  id: string;
  label: string;
  text: string;
}

export type SessionMode = 'default' | 'bypass' | 'sandbox';

export interface PanelState {
  mode: SessionMode;
  chips: ContextChip[];
  sessionActive: boolean;
}

export type WebviewMessage =
  | { type: 'ready' }
  | { type: 'send'; message: string }
  | { type: 'removeChip'; id: string }
  | { type: 'setMode'; mode: SessionMode }
  | { type: 'openSlashPicker' }
  | { type: 'openModelPicker' }
  | { type: 'newSession' }
  | { type: 'startSession' };

export type HostMessage =
  | { type: 'state'; state: PanelState }
  | { type: 'chipAdded'; chip: ContextChip }
  | { type: 'sessionStatusChanged'; active: boolean }
  | { type: 'clearAfterSend' };
