export interface Action {
  label: string;
  command: string;
  index: number;
  icon?: string;
  title?: string;
  target?: string;
  href?: string;
  rel?: string;
  customClassName?: string;
}
