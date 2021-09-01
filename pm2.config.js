module.exports = {
  apps: [
    {
      name: "single-user-login-api",
      script: "npm",
      args: "run dev:api",
      watch: ["./api/src"],
      env: {
        "PORT": 5000,
        "SECRET": "ThisIsJWTSecret",
      }
    },
    {
      name: "single-user-login-app",
      script: "npm",
      args: "run dev:app",
      env: {
        "REACT_APP_API": "http://localhost:5000"
      }
    }
  ]
}