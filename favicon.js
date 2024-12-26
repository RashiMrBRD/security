// Create canvas and context
const canvas = document.createElement('canvas');
canvas.width = 32;
canvas.height = 32;
const ctx = canvas.getContext('2d');

// Set background
ctx.fillStyle = '#1a1a1a';
ctx.fillRect(0, 0, 32, 32);

// Draw gear icon
ctx.beginPath();
ctx.strokeStyle = '#ff4747';
ctx.lineWidth = 2;
ctx.arc(16, 16, 8, 0, Math.PI * 2);
ctx.stroke();

// Draw gear teeth
for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.save();
    ctx.translate(16, 16);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(8, -2);
    ctx.lineTo(12, -2);
    ctx.lineTo(12, 2);
    ctx.lineTo(8, 2);
    ctx.closePath();
    ctx.fillStyle = '#ff4747';
    ctx.fill();
    ctx.restore();
}

// Draw center dot
ctx.beginPath();
ctx.arc(16, 16, 3, 0, Math.PI * 2);
ctx.fillStyle = '#ff4747';
ctx.fill();

// Convert to base64
const dataUrl = canvas.toDataURL('image/png');
const link = document.createElement('link');
link.type = 'image/x-icon';
link.rel = 'shortcut icon';
link.href = dataUrl;
document.head.appendChild(link);
