declare module '*.json' {
  const value: any;
  export default value;
}

declare interface WebpackerArgs {
  mode: 'development' | 'production' | 'server';
  watch: boolean;
  config?: string;
  merge?: string;
  color?: boolean;
  progress?: boolean;
  json?: boolean;
}
