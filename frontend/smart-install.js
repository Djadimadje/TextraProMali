const fs = require('fs');
const { execSync } = require('child_process');

console.log('========================================');
console.log('  TextPro AI Frontend - Smart Installer');
console.log('========================================\n');

// Check if Node.js is available
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`Node.js found! Version: ${nodeVersion}`);
} catch (error) {
    console.error('ERROR: Node.js is not installed!');
    console.error('Please download and install Node.js from: https://nodejs.org/');
    process.exit(1);
}

console.log('\nInstalling dependencies from requirements.txt...');
console.log('This may take a few minutes...\n');

try {
    // Read requirements.txt
    const requirementsTxt = fs.readFileSync('requirements.txt', 'utf8');
    
    // Parse package names (exclude comments and empty lines)
    const packages = requirementsTxt
        .split('\n')
        .filter(line => {
            const trimmed = line.trim();
            return trimmed && 
                   !trimmed.startsWith('#') && 
                   !trimmed.includes('Install command');
        })
        .map(line => line.trim());

    if (packages.length > 0) {
        console.log(`Found ${packages.length} packages in requirements.txt:`);
        packages.forEach(pkg => console.log(`  - ${pkg}`));
        
        console.log('\nInstalling packages...');
        
        // Install packages in chunks to avoid command line length limits
        const chunkSize = 10;
        for (let i = 0; i < packages.length; i += chunkSize) {
            const chunk = packages.slice(i, i + chunkSize);
            const installCmd = `npm install ${chunk.join(' ')}`;
            
            console.log(`Installing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(packages.length/chunkSize)}...`);
            execSync(installCmd, { stdio: 'inherit' });
        }
        
        console.log('\n✅ All packages from requirements.txt installed successfully!');
    } else {
        throw new Error('No valid packages found in requirements.txt');
    }
    
} catch (error) {
    console.log('\n⚠️  Could not install from requirements.txt, using package.json instead...');
    console.log('Error:', error.message);
    
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('\n✅ Packages installed from package.json successfully!');
    } catch (npmError) {
        console.error('\n❌ Failed to install packages!');
        console.error('Error:', npmError.message);
        process.exit(1);
    }
}

console.log('\n========================================');
console.log('  Setup Complete!');
console.log('========================================');
console.log('\nTo start the development server, run:');
console.log('  npm run dev');
console.log('\nThen open your browser to: http://localhost:3000');
console.log('');
