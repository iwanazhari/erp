module.exports = {
  apps: [
    {
      name: 'worksy-frontend',
      script: '/usr/local/bin/serve',
      args: '/var/www/erp -s -p 3000',
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
