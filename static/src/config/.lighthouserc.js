const collect = {};
const fs = require('fs');

if (fs.existsSync('app/config.js')) {
  if (fs.existsSync('.urls.json')) {
    //Express
    const urls = JSON.parse(fs.readFileSync('.urls.json', 'utf-8'));
    collect.url = urls;
    collect.startServerCommand = 'npm start';
    collect.startServerReadyPattern = 'app listening';
  }
} else {
  //Not express
  collect.staticDistDir = './';
}

module.exports = {
  ci: {
    collect: collect,
    upload: {
      target: 'temporary-public-storage',
      githubAppToken: '8jXYjOyRHfe:7121610:WVELHV16RNlgk',
    },
  },
};
