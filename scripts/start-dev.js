const { spawn } = require('child_process');
const net = require('net');

const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};

const startDevServer = async () => {
  try {
    const defaultPort = process.env.PORT || 5000;
    const availablePort = await findAvailablePort(defaultPort);
    
    if (availablePort !== defaultPort) {
      console.log(`⚠️  Port ${defaultPort} is in use, using port ${availablePort} instead`);
      process.env.PORT = availablePort;
    }
    
    console.log(`🚀 Starting RecurSpace development server...`);
    console.log(`📡 Server will be available at: http://localhost:${availablePort}`);
    console.log(`🏥 Health check: http://localhost:${availablePort}/api/health`);
    
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: availablePort }
    });
    
    server.on('error', (error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
    
    process.on('SIGINT', () => {
      server.kill('SIGINT');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error starting development server:', error);
    process.exit(1);
  }
};

startDevServer(); 