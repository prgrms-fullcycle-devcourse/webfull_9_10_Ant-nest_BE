module.exports = {
  apps: [
    {
      name: "webfull_9_19_Ant-nest_BE",
      script: "dist/main.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
