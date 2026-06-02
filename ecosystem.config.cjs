module.exports = {
  apps: [
    {
      name: 'worksy-frontend',
      script: '/root/.nvm/versions/node/v20.20.2/bin/serve',
      args: '/root/erp/dist -p 3000 --single',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
