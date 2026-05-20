import {createCanvas, loadImage} from '@napi-rs/canvas';

const WIDTH = 2048;
const HEIGHT = 682;
const CARD_X = 92;
const CARD_Y = 123;
const CARD_WIDTH = 1868;
const CARD_HEIGHT = 455;
const AVATAR_SIZE = 228;
const BAR_X = 166;
const BAR_Y = 485;
const BAR_WIDTH = 1578;
const BAR_HEIGHT = 52;
const FONT_FAMILY = '"DejaVu Sans", sans-serif';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<[number, number]>} points
 * @returns {void}
 */
function pathPolygon(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @returns {void}
 */
function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {import('@napi-rs/canvas').Image} image
 * @returns {void}
 */
function drawCircularImage(ctx, x, y, size, image) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x, y, size, size);
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} color
 * @returns {void}
 */
function drawSpark(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} color
 * @returns {void}
 */
function drawStarIcon(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x + size * 0.15, y - size * 0.15, x + size, y);
    ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.15, x, y + size);
    ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.15, x - size, y);
    ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.15, x, y - size);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} color
 * @returns {void}
 */
function drawShieldIcon(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.9, y - size * 0.58);
    ctx.lineTo(x + size * 0.8, y + size * 0.42);
    ctx.quadraticCurveTo(x + size * 0.15, y + size * 1.05, x, y + size * 1.18);
    ctx.quadraticCurveTo(x - size * 0.15, y + size * 1.05, x - size * 0.8, y + size * 0.42);
    ctx.lineTo(x - size * 0.9, y - size * 0.58);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, y - size * 0.1);
    ctx.lineTo(x + size * 0.3, y + size * 0.5);
    ctx.moveTo(x + size * 0.3, y - size * 0.1);
    ctx.lineTo(x - size * 0.3, y + size * 0.5);
    ctx.stroke();
    ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 * @returns {void}
 */
function fitText(ctx, text, x, y, maxWidth) {
    let fontSize = 84;
    do {
        ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
        fontSize -= 4;
    } while (ctx.measureText(text).width > maxWidth && fontSize > 36);
    ctx.fillText(text, x, y);
}

/**
 * @param {import('discord.js').User} user
 * @param {import('discord.js').GuildMember|null} member
 * @param {import('../../database/Level.js').default} level
 * @param {string} rewardRoleName
 * @returns {Promise<Buffer>}
 */
export async function buildRankCard(user, member, level, rewardRoleName) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    const cyan = '#2ce9f1';
    const blue = '#66a4ff';
    const violet = '#8a6cff';
    const white = '#f6f8ff';
    const muted = '#c4c7d8';
    const line = 'rgba(128, 164, 255, 0.32)';
    const progress = Math.max(0, Math.min(1, level.xpToNextLevel ? level.xp / level.xpToNextLevel : 0));
    const statValueY = 354;

    const bg = ctx.createRadialGradient(WIDTH * 0.5, HEIGHT * 0.4, 50, WIDTH * 0.5, HEIGHT * 0.4, WIDTH * 0.55);
    bg.addColorStop(0, '#11192b');
    bg.addColorStop(0.45, '#0a1020');
    bg.addColorStop(1, '#050914');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const haze = ctx.createRadialGradient(WIDTH * 0.82, HEIGHT * 0.38, 20, WIDTH * 0.82, HEIGHT * 0.38, 420);
    haze.addColorStop(0, 'rgba(151, 106, 255, 0.12)');
    haze.addColorStop(1, 'rgba(151, 106, 255, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const cardPoints = [
        [CARD_X + 46, CARD_Y],
        [CARD_X + CARD_WIDTH - 70, CARD_Y],
        [CARD_X + CARD_WIDTH, CARD_Y + 66],
        [CARD_X + CARD_WIDTH, CARD_Y + CARD_HEIGHT - 160],
        [CARD_X + CARD_WIDTH - 178, CARD_Y + CARD_HEIGHT],
        [CARD_X + 18, CARD_Y + CARD_HEIGHT],
        [CARD_X, CARD_Y + CARD_HEIGHT - 42],
        [CARD_X, CARD_Y + 50],
    ];

    pathPolygon(ctx, cardPoints);
    const cardFill = ctx.createLinearGradient(CARD_X, CARD_Y, CARD_X + CARD_WIDTH, CARD_Y + CARD_HEIGHT);
    cardFill.addColorStop(0, 'rgba(12,18,34,0.98)');
    cardFill.addColorStop(0.6, 'rgba(14,18,33,0.96)');
    cardFill.addColorStop(1, 'rgba(19,24,46,0.96)');
    ctx.fillStyle = cardFill;
    ctx.fill();

    ctx.save();
    pathPolygon(ctx, cardPoints);
    ctx.clip();
    const topGlow = ctx.createLinearGradient(CARD_X, CARD_Y, CARD_X + CARD_WIDTH, CARD_Y);
    topGlow.addColorStop(0, 'rgba(66, 213, 255, 0.18)');
    topGlow.addColorStop(0.5, 'rgba(124, 137, 255, 0.12)');
    topGlow.addColorStop(1, 'rgba(209, 108, 255, 0.22)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(CARD_X, CARD_Y, CARD_WIDTH, 22);
    ctx.restore();

    ctx.lineWidth = 4;
    ctx.strokeStyle = line;
    pathPolygon(ctx, cardPoints);
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(140,110,255,0.14)';
    ctx.beginPath();
    ctx.moveTo(CARD_X + CARD_WIDTH - 6, CARD_Y + 120);
    ctx.lineTo(CARD_X + CARD_WIDTH - 6, CARD_Y + CARD_HEIGHT - 156);
    ctx.stroke();

    const avatarUrl = member?.displayAvatarURL({extension: 'png', size: 256}) ?? user.displayAvatarURL({extension: 'png', size: 256});
    const avatarResponse = await fetch(avatarUrl);
    const avatarBuffer = Buffer.from(await avatarResponse.arrayBuffer());
    const avatar = await loadImage(avatarBuffer);

    const avatarX = 144;
    const avatarY = 178;
    const ringCx = avatarX + AVATAR_SIZE / 2;
    const ringCy = avatarY + AVATAR_SIZE / 2;
    const ringRadius = 133;

    ctx.save();
    ctx.shadowColor = 'rgba(86, 227, 255, 0.32)';
    ctx.shadowBlur = 22;
    ctx.lineCap = 'round';
    ctx.lineWidth = 10;
    const avatarRing = ctx.createLinearGradient(ringCx - ringRadius, ringCy, ringCx + ringRadius, ringCy);
    avatarRing.addColorStop(0, violet);
    avatarRing.addColorStop(0.55, blue);
    avatarRing.addColorStop(1, cyan);
    ctx.strokeStyle = avatarRing;
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, ringRadius, Math.PI * 0.83, Math.PI * 2.15);
    ctx.stroke();
    ctx.restore();

    drawCircularImage(ctx, avatarX, avatarY, AVATAR_SIZE, avatar);
    drawSpark(ctx, avatarX + 22, avatarY + 130, 12, 'rgba(135, 121, 255, 0.8)');
    drawSpark(ctx, avatarX + 192, avatarY + 32, 10, 'rgba(97, 229, 255, 0.8)');
    drawSpark(ctx, avatarX + 250, avatarY - 2, 12, 'rgba(135, 121, 255, 0.7)');

    const name = `@${member?.displayName ?? user.globalName ?? user.username}`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = white;
    fitText(ctx, name, 512, 221, 760);

    ctx.font = `54px ${FONT_FAMILY}`;
    ctx.fillStyle = muted;
    ctx.fillText('Level', 626, statValueY);
    ctx.fillText('XP', 884, statValueY);
    ctx.fillText('Role', 1457, statValueY);

    ctx.font = `bold 58px ${FONT_FAMILY}`;
    ctx.fillStyle = cyan;
    ctx.fillText(String(level.level), 755, statValueY - 6);
    ctx.fillText(`${level.xp.toLocaleString()} / ${level.xpToNextLevel.toLocaleString()}`, 994, statValueY - 6);
    ctx.fillStyle = violet;
    fitText(ctx, rewardRoleName, 1597, statValueY - 6, 280);

    drawStarIcon(ctx, 548, statValueY + 16, 24, violet);
    drawShieldIcon(ctx, 1383, statValueY + 18, 26, violet);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(832, 338);
    ctx.lineTo(832, 408);
    ctx.moveTo(1296, 338);
    ctx.lineTo(1296, 408);
    ctx.stroke();

    roundedRect(ctx, BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, 26);
    const barBase = ctx.createLinearGradient(BAR_X, BAR_Y, BAR_X + BAR_WIDTH, BAR_Y);
    barBase.addColorStop(0, 'rgba(255,255,255,0.12)');
    barBase.addColorStop(1, 'rgba(255,255,255,0.16)');
    ctx.fillStyle = barBase;
    ctx.fill();

    const fillWidth = Math.max(56, BAR_WIDTH * progress);
    roundedRect(ctx, BAR_X, BAR_Y, fillWidth, BAR_HEIGHT, 26);
    const barFill = ctx.createLinearGradient(BAR_X, BAR_Y, BAR_X + fillWidth, BAR_Y);
    barFill.addColorStop(0, '#16dae1');
    barFill.addColorStop(0.55, '#3dd8ef');
    barFill.addColorStop(1, '#7c84ff');
    ctx.fillStyle = barFill;
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    roundedRect(ctx, BAR_X + 14, BAR_Y + 8, Math.max(30, fillWidth - 28), 10, 5);
    ctx.fill();
    ctx.restore();

    const dots = [cyan, violet, cyan];
    for (let i = 0; i < dots.length; i++) {
        ctx.fillStyle = dots[i];
        ctx.beginPath();
        ctx.arc(CARD_X + CARD_WIDTH - 154 + (i * 34), CARD_Y + 56, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(126, 125, 255, 0.18)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const startX = CARD_X + CARD_WIDTH - 242 + (i * 18);
        ctx.beginPath();
        ctx.moveTo(startX, CARD_Y + 272 + (i * 3));
        ctx.lineTo(startX + 118, CARD_Y + 120 + (i * 3));
        ctx.stroke();
    }
    ctx.restore();

    return canvas.toBuffer('image/png');
}
