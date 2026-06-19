export {};

declare global {
  /** Base route type used across the ERP */
  interface RoutesType {
    name: string;
    layout: string;
    component?: JSX.Element;
    icon: JSX.Element | string;
    path: string;
    secondary?: boolean;
    children?: SubRouteType[];
  }

  interface SubRouteType {
    name: string;
    path: string;
    component: JSX.Element;
  }
}
