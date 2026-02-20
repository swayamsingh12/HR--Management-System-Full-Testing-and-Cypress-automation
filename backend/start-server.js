import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function findProcessOnPort(port) {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        return pid;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function killProcess(pid) {
  try {
    await execAsync(`taskkill /PID ${pid} /F`);
    console.log(`✅ Killed process ${pid} on port 5000`);
    return true;
  } catch (error) {
    console.log(`⚠️  Could not kill process ${pid}: ${error.message}`);
    return false;
  }
}

async function startServer() {
  const pid = await findProcessOnPort(5000);
  
  if (pid) {
    console.log(`⚠️  Port 5000 is already in use by process ${pid}`);
    console.log('🔄 Attempting to free the port...');
    await killProcess(pid);
    // Wait a bit for the port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🚀 Starting server...');
  
  const server = spawn('node', ['src/server.js'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ Error starting server:', error);
  });

  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
    }
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    server.kill();
    process.exit(0);
  });
}

startServer();

