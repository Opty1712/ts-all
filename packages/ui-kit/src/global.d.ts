import {FunctionComponent, SVGProps} from 'react';

declare global {
  declare module '*.css';
  declare module '*.module.css';
  declare module '*.svg' {
    const content: FunctionComponent<SVGProps<SVGSVGElement>>;
    export default content;
  }
}
