import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

export default {
    input: "src/index.ts",
    output: [
        {
            file: "dist/editor.esm.js",
            format: "esm",
            sourcemap: true
        },
        {
            file: "dist/editor.cjs.js",
            format: "cjs",
            sourcemap: true
        }
    ],
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            noEmitOnError: true,
            sourceMap: true,
            declaration: true,
            declarationDir: 'dist/types',
            outDir: 'dist'
        }),
        resolve(),
        commonjs(),
        terser(),
        postcss({
            extract: true,
            minimize: true,
            sourceMap: true
        })
    ]
};