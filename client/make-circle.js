const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
const svgPath = path.join(__dirname, 'src', 'assets', 'favicon.svg');

// Read the image
const base64Data = fs.readFileSync(iconPath).toString('base64');
const dataUri = `data:image/png;base64,${base64Data}`;

// Create SVG with circular clip-path
// We don't know the exact dimensions, but assuming it's square,
// we can use viewBox 0 0 100 100 and percentage or relative coords
const svgContent = `<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="circleView">
      <circle cx="50" cy="50" r="50" />
    </clipPath>
  </defs>
  <image width="100" height="100" href="${dataUri}" clip-path="url(#circleView)" preserveAspectRatio="xMidYMid slice" />
</svg>`;

fs.writeFileSync(svgPath, svgContent);
console.log('Successfully created favicon.svg');
