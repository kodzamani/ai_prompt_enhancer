const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');

// Create dist if it doesn't exist
if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist, { recursive: true });
}

// Files to copy
const files = ['index.html', 'styles.css', 'renderer.js'];
files.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(dist, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${file}`);
    } else {
        console.warn(`Warning: ${file} not found`);
    }
});

// Copy icons directory recursively
function copyDirSync(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) return;
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

copyDirSync(path.join(__dirname, 'icons'), path.join(dist, 'icons'));
console.log('Copied icons/');
console.log('Web assets copied to dist/ successfully!');
