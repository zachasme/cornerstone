import babel from 'rollup-plugin-babel';

const pkg = require('./package.json');
const banner = `/*! ${pkg.name} - v${pkg.version} - ${new Date().toISOString()}` +
    '| (c) 2016 Chris Hafey | https://github.com/chafey/cornerstone */\n';

export default {
  entry: 'src/cornerstone.js',
  moduleName: 'cornerstone',
  plugins: [
    babel({
      babelrc: false,
      runtimeHelpers: true,
      "presets": [
        ["es2015", {modules:false}]
      ],
      "plugins": ["external-helpers"]
    })
  ],
  banner: banner,
  sourceMap: true,
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
    },
    {
      dest: pkg.module,
      format: 'es',
    },
  ]
};
