module.exports = {
  apps: [
    {
      name: 'worksy-frontend',
      script: 'node_modules/.bin/serve',
      args: 'dist -s -p 3000',
      cwd: '/root/erp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
