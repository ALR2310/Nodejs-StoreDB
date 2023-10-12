module.exports = {
  apps : [{
    script: './asset/src/app.js',
    watch: '.'
  }],

  deploy : {
    production : {
      user : 'deploy',
      host : '192.168.1.116',
      ref  : 'origin/master',
      repo : 'https://github.com/AnLeRIP2310/Nodejs-StoreDB.git',
      path : 'D:/LeThanhAn/Nodejs/Nodejs-StoreDB/',
      'post-deploy' : 'npm install', 
      env: {
        NODE_ENV: 'production',
      }
    }
  }
};
