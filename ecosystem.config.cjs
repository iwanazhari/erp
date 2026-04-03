/**
 * =============================================================================
 * PM2 Ecosystem Configuration for Worksy ERP Frontend
 * =============================================================================
 * 
 * Usage:
 *   - Start: pm2 start ecosystem.config.cjs
 *   - Stop: pm2 stop ecosystem.config.cjs
 *   - Restart: pm2 restart ecosystem.config.cjs
 *   - Delete: pm2 delete ecosystem.config.cjs
 *   - Status: pm2 status
 *   - Logs: pm2 logs
 * 
 * Environment Variables:
 *   - NODE_ENV: production
 *   - PORT: Server port (default: 3000)
 *   - VITE_API_URL: Backend API URL
 *   - VITE_GEOAPIFY_API_KEY: Geoapify API key
 * =============================================================================
 */

module.exports = {
  apps: [
    {
      // Application name (appears in pm2 status)
      name: 'worksy-frontend',

      // Main server script
      script: './server.cjs',

      // Working directory
      cwd: '.',

      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Default API URL - override in .env.production or via pm2 start --env
        VITE_API_URL: 'http://localhost:15320/api',
      },

      // Production environment (override via pm2 start ecosystem.config.cjs --env production)
      env_production: {
        NODE_ENV: 'production',
        PORT: 80,
        VITE_API_URL: 'https://worksy-production.up.railway.app/api',
      },

      // Process management
      instances: 1, // Single instance for frontend server
      exec_mode: 'fork', // Fork mode for single instance

      // Auto-restart on crash
      autorestart: true,

      // Watch for file changes (disable in production)
      watch: false,

      // Max memory before restart (adjust based on your server)
      max_memory_restart: '500M',

      // Graceful shutdown timeout (ms)
      kill_timeout: 3000,

      // Time between restarts (ms) - prevents restart loops
      min_uptime: '10s',
      max_restarts: 10,

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2/error.log',
      out_file: './logs/pm2/out.log',
      merge_logs: true,

      // Advanced settings
      disable_logs: false,
      log_type: 'json', // json, cli, raw
      listener_timeout: 60000,

      // Cluster settings (only used if instances > 1)
      cluster_max_memory: 0,

      // Source map support
      source_map_support: true,

      // Wait for application to be ready before marking as online
      wait_ready: true,
      listen_timeout: 10000,

      // Health check (optional - requires server to expose /health endpoint)
      // max_uptime: '6h', // Force restart after 6 hours
    },
  ],

  // Deployment configuration (optional - for remote deployment)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/worksy-frontend.git',
      path: '/var/www/worksy-frontend',
      'pre-deploy-local': 'npm run build',
      'post-deploy': 'npm install && pm2 restart ecosystem.config.cjs --env production',
      'pre-setup': 'mkdir -p /var/www/worksy-frontend',
    },
  },
};
