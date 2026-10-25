import tseslint from "typescript-eslint";
export default [...tseslint.configs.recommended, { ignores: [".next/**", "next-env.d.ts"] }];
