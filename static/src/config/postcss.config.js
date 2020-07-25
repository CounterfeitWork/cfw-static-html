module.exports = () => {
  const Path = require('path');
  const DistDirPath = Path.resolve(__dirname, '../../dist');
  return {
    plugins: {
      'postcss-normalize': {},
      'postcss-flexbugs-fixes': {},
      'postcss-critical-css': {
        outputPath: Path.join(DistDirPath, '/css'),
        preserve: false,
      },
      'postcss-preset-env': {
        stage: 3,
        autoprefixer: {
          grid: 'autoplace',
        },
      },
    },
  };
};
