declare module '*.css';
declare module '*.svg';
declare module 'oslllo-svg-fixer' {
  type SVGFixer = (input: string, output: string, input: Record<string, boolean>) => {fix: () => Promise<void>};
  const svgFixer: SVGFixer;
  export default svgFixer;
}
