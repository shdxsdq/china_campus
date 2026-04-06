const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "china-campus-web",
      cwd: path.resolve(__dirname, "../../web"),
      script: "npm",
      args: "start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      max_memory_restart: "512M",
      time: true,
    },
    {
      name: "china-campus-cms",
      cwd: path.resolve(__dirname, "../../cms"),
      script: "npm",
      args: "start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: "1337",
      },
      max_memory_restart: "1G",
      time: true,
    },
  ],
};
