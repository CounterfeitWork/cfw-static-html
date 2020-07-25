module.exports = () => {
  try {
    const configPath = require.resolve('./../../../config.js');
    return require(configPath).express.port;
  } catch (e) {
    const Package = require(`${process.cwd()}/package.json`);
    if (Package.config && Package.config.dev_server_port) {
      if (Package.config.dev_server_port === '<port>') {
        return 3000;
      }
      return Package.config.dev_server_port;
    }
    return 9000;
  }
};
