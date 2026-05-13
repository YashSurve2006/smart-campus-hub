/**
 * PM2 process file — run from repo root:
 *   pm2 start deploy/ecosystem.config.cjs --env production
 */
module.exports = {
  apps: [
    {
      name: 'smart-campus-api',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
