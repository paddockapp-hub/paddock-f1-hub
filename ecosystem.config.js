module.exports = {
  apps: [{
    name: 'paddock-f1-server',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 8888
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 80
    }
  }]
};
