declare interface WebpackerArgs {
  mode: 'development' | 'production' | 'server';
  watch: boolean;
  config?: string;
  color?: boolean;
  progress?: boolean;
  json?: boolean;
}
