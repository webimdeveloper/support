module.exports = {
  apps: [{
    name: 'support-portal',
    script: '.output/server/index.mjs',
    cwd: '/var/www/support-portal',
    instances: 1,
    autorestart: true,
    watch: false,
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    }
  }]
}
