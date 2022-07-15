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
  onClick?: (app?: any) => void;
}

export interface ActionButton{
  key?: string;
  icon?: string | JSX.Element;
  title?: string;
  label?: string;
  target?: string;
  isDisabled?: boolean;
  href?: string;
  rel?: string;
  customClassName?: string;
  onClick?: () => void;
}
