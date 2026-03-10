module.exports = {
  apps: [
    {
      name: 'souqli-api',
      cwd: '/var/www/souqli_bscckend',
      script: 'src/server.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
