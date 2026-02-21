#!/usr/bin/env node

/**
 * VIF Activity Tracker - Quick Start Script
 * Automates the setup and testing process
 * 
 * Usage: node quick-start.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBox(title, color = 'blue') {
  const width = 60;
  console.log('\n' + colors[color] + '═'.repeat(width) + colors.reset);
  console.log(colors[color] + colors.bold + title.padStart((width + title.length) / 2).padEnd(width) + colors.reset);
  console.log(colors[color] + '═'.repeat(width) + colors.reset + '\n');
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options 
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

function checkNodeVersion() {
  const version = process.version.match(/^v(\d+)\./)[1];
  return parseInt(version) >= 16;
}

function checkCommand(command) {
  try {
    exec(`${command} --version`, { silent: true });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  logBox('🚀 VIF Activity Tracker - Quick Start', 'cyan');
  
  log('Welcome! This script will help you set up and run the VIF Activity Tracker.', 'cyan');
  log('The process will take about 5 minutes.\n', 'cyan');

  // Step 1: Prerequisites Check
  logBox('Step 1/5: Checking Prerequisites', 'blue');
  
  log('Checking Node.js version...', 'yellow');
  if (!checkNodeVersion()) {
    log('❌ Node.js 16+ is required. Please upgrade Node.js.', 'red');
    log('Download from: https://nodejs.org/', 'yellow');
    process.exit(1);
  }
  log('✅ Node.js version is compatible', 'green');

  log('\nChecking npm...', 'yellow');
  if (!checkCommand('npm')) {
    log('❌ npm is not installed', 'red');
    process.exit(1);
  }
  log('✅ npm is installed', 'green');

  log('\nChecking project structure...', 'yellow');
  const requiredDirs = ['server', 'src', 'public'];
  const requiredFiles = ['package.json', 'server/index.js', 'server/init-db.js'];
  
  let allExists = true;
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      log(`❌ Missing directory: ${dir}`, 'red');
      allExists = false;
    }
  }
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      log(`❌ Missing file: ${file}`, 'red');
      allExists = false;
    }
  }
  
  if (!allExists) {
    log('\n❌ Project structure is incomplete', 'red');
    log('Please ensure you\'re in the vif-activity-tracker directory', 'yellow');
    process.exit(1);
  }
  log('✅ Project structure is complete', 'green');

  // Step 2: Install Dependencies
  logBox('Step 2/5: Installing Dependencies', 'blue');
  
  if (fs.existsSync('node_modules')) {
    const answer = await question('Dependencies already installed. Reinstall? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      log('✅ Skipping dependency installation', 'green');
    } else {
      log('\nInstalling dependencies (this may take 1-2 minutes)...', 'yellow');
      exec('npm install');
      log('✅ Dependencies installed successfully', 'green');
    }
  } else {
    log('Installing dependencies (this may take 1-2 minutes)...', 'yellow');
    exec('npm install');
    log('✅ Dependencies installed successfully', 'green');
  }

  // Step 3: Initialize Database
  logBox('Step 3/5: Initializing Database', 'blue');
  
  log('Initializing database with 17 employees...', 'yellow');
  try {
    exec('node server/init-db.js');
    log('✅ Database initialized successfully', 'green');
  } catch (error) {
    log('❌ Database initialization failed', 'red');
    log('Error: ' + error.message, 'red');
    const answer = await question('\nContinue anyway? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  // Step 4: Test Server
  logBox('Step 4/5: Testing Server', 'blue');
  
  log('Starting server for quick test...', 'yellow');
  
  const serverProcess = spawn('node', ['server/index.js'], {
    stdio: 'pipe',
    detached: false
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  log('Testing health endpoint...', 'yellow');
  try {
    const http = require('http');
    const testResult = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000/api/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.status === 'ok');
          } catch {
            resolve(false);
          }
        });
      });
      req.on('error', () => resolve(false));
      setTimeout(() => resolve(false), 5000);
    });

    serverProcess.kill();

    if (testResult) {
      log('✅ Server is working correctly!', 'green');
    } else {
      log('⚠️  Server started but health check failed', 'yellow');
    }
  } catch (error) {
    serverProcess.kill();
    log('⚠️  Could not test server (will try full start)', 'yellow');
  }

  // Step 5: Choose what to do next
  logBox('Step 5/5: Launch Options', 'blue');
  
  console.log('What would you like to do?\n');
  console.log('  1. Start the server (Ctrl+C to stop)');
  console.log('  2. Run API tests');
  console.log('  3. Both (start server and run tests)');
  console.log('  4. Exit (I\'ll start it manually)\n');
  
  const choice = await question('Enter your choice (1-4): ');
  
  rl.close();

  switch (choice.trim()) {
    case '1':
      logBox('🚀 Starting Server', 'green');
      log('Server will start on http://localhost:3000', 'cyan');
      log('Press Ctrl+C to stop the server\n', 'yellow');
      
      console.log(colors.cyan + '─'.repeat(60) + colors.reset + '\n');
      
      exec('node server/index.js');
      break;

    case '2':
      logBox('🧪 Running API Tests', 'green');
      log('Make sure the server is running in another terminal!', 'yellow');
      log('Run: npm start\n', 'cyan');
      
      const answer = await question('Is the server running? (y/N): ');
      if (answer.toLowerCase() === 'y') {
        exec('node test-api.js');
      } else {
        log('\nStart the server first with: npm start', 'yellow');
      }
      break;

    case '3':
      logBox('🚀 Starting Server + Running Tests', 'green');
      log('Server will start in background, then tests will run\n', 'cyan');
      
      // Start server in background
      const bgServer = spawn('node', ['server/index.js'], {
        stdio: 'pipe',
        detached: true
      });
      
      log('⏳ Waiting for server to start (5 seconds)...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      log('✅ Server started, running tests...\n', 'green');
      
      try {
        exec('node test-api.js');
      } finally {
        log('\nStopping background server...', 'yellow');
        bgServer.kill();
        log('✅ Background server stopped', 'green');
      }
      break;

    case '4':
    default:
      logBox('✅ Setup Complete!', 'green');
      log('To start the server manually, run:', 'cyan');
      log('  npm start\n', 'bold');
      log('To run tests, run:', 'cyan');
      log('  node test-api.js\n', 'bold');
      log('To see all commands, check:', 'cyan');
      log('  LOCAL_TESTING_GUIDE.md\n', 'bold');
      break;
  }

  logBox('✨ All Done!', 'green');
  
  console.log('Quick reference:');
  console.log('  • Start server:  ' + colors.cyan + 'npm start' + colors.reset);
  console.log('  • Run tests:     ' + colors.cyan + 'node test-api.js' + colors.reset);
  console.log('  • View docs:     ' + colors.cyan + 'LOCAL_TESTING_GUIDE.md' + colors.reset);
  console.log('  • Admin login:   ' + colors.cyan + 'asadeq@viftraining.com' + colors.reset);
  console.log('  • Employee login:' + colors.cyan + 'omar@viftraining.com' + colors.reset);
  console.log('  • Access app:    ' + colors.cyan + 'http://localhost:3000' + colors.reset);
  console.log();
}

main().catch(error => {
  log('\n❌ Quick start failed: ' + error.message, 'red');
  process.exit(1);
});
