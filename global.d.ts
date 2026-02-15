declare module '@eslint/js' {
  import type {Linter} from 'eslint';
  export default {configs: Linter.Config};
}

declare module 'eslint-plugin-react-hooks' {
  import type {Linter} from 'eslint';
  export default {configs: Linter.Config};
}

declare module 'eslint-plugin-react-memo' {
  import type {Linter} from 'eslint';
  export default {configs: Linter.Config};
}

declare module 'eslint-plugin-no-autofix' {
  import type {Linter} from 'eslint';
  export default {configs: Linter.Config};
}

declare module 'eslint-plugin-tailwindcss' {
  import type {Linter} from 'eslint';
  export default {configs: Linter.Config};
}

declare module 'eslint-plugin-no-only-tests' {
  import type {Linter} from 'eslint';
  export default {configs: Linter.Config};
}

declare module '@typescript-eslint/parser' {
  import type {Linter} from 'eslint';
  export const parser: Linter.Parser;
}
