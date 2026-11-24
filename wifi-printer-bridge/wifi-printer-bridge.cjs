/**
 * RETSOL RTP-82UW Wi-Fi Thermal Printer Bridge for JB Pavilion & Cafe
 * 
 * Communicates directly with RETSOL RTP-82UW 3" Thermal Receipt Printer over local Wi-Fi (Port 9100).
 * Runs an HTTP endpoint on port 8080 for web apps (Vercel & Localhost) to trigger silent printing.
 * 
 * Default Printer IP: 192.168.1.100 (configurable via config.json or environment variable PRINTER_IP)
 * Default Printer Port: 9100 (Standard RAW TCP for ESC/POS)
 */

const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');

// Load or initialize local config
const CONFIG_FILE = path.join(__dirname, 'printer-config.json');
let config = {
  printerIp: process.env.PRINTER_IP || '192.168.1.100',
  printerPort: parseInt(process.env.PRINTER_PORT || '9100', 10),
  serverPort: parseInt(process.env.PORT || '8080', 10),
  beepOnPrint: true,
  autoCut: true,
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
    config = { ...config, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('[Config] Failed to parse printer-config.json, using defaults.');
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error('[Config] Failed to save printer-config.json:', err.message);
  }
}

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';

const CMD = {
  INIT: Buffer.from([0x1B, 0x40]),                        // ESC @ (Initialize printer)
  ALIGN_LEFT: Buffer.from([0x1B, 0x61, 0x00]),            // ESC a 0
  ALIGN_CENTER: Buffer.from([0x1B, 0x61, 0x01]),          // ESC a 1
  ALIGN_RIGHT: Buffer.from([0x1B, 0x61, 0x02]),           // ESC a 2
  TEXT_NORMAL: Buffer.from([0x1D, 0x21, 0x00]),           // GS ! 0x00
  TEXT_BOLD_ON: Buffer.from([0x1B, 0x45, 0x01]),          // ESC E 1
  TEXT_BOLD_OFF: Buffer.from([0x1B, 0x45, 0x00]),         // ESC E 0
  TEXT_DOUBLE: Buffer.from([0x1D, 0x21, 0x11]),           // GS ! 0x11 (2x width + 2x height)
  TEXT_DOUBLE_HEIGHT: Buffer.from([0x1D, 0x21, 0x01]),    // GS ! 0x01 (2x height)
  INVERT_ON: Buffer.from([0x1D, 0x42, 0x01]),             // GS B 1 (Reverse black/white)
  INVERT_OFF: Buffer.from([0x1D, 0x42, 0x00]),            // GS B 0
  FEED_LINES: (n) => Buffer.from([0x1B, 0x64, n]),        // ESC d n
  PARTIAL_CUT: Buffer.from([0x1D, 0x56, 0x01]),           // GS V 1 (Partial cut)
  FULL_CUT: Buffer.from([0x1D, 0x56, 0x00]),              // GS V 0 (Full cut)
  BEEP: Buffer.from([0x1B, 0x42, 0x02, 0x02]),            // ESC B 2 2 (Beep 2 times)
};

const LINE_WIDTH = 48; // Standard 48 characters for 80mm thermal paper at font A (12x24)

function makeDivider(char = '-') {
  return char.repeat(LINE_WIDTH) + '\n';
}

function padLine(left, right, width = LINE_WIDTH) {
  const leftStr = String(left || '');
  const rightStr = String(right || '');
  const spaceCount = Math.max(1, width - leftStr.length - rightStr.length);
  return leftStr + ' '.repeat(spaceCount) + rightStr + '\n';
}

/**
 * Builds raw ESC/POS binary data for RETSOL RTP-82UW Wi-Fi thermal printer
 */
function buildKotEscPos(data) {
  const brandName = (data.brand === 'KUNAFA' ? 'KUNAFA DESSERTS' : 'JB PAVILION & CAFE').toUpperCase();
  const tableName = (data.tableName || 'Takeaway').toUpperCase();
  const customerName = (data.customerName || 'Guest').trim();
  const dateStr = data.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = data.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const notes = (data.notes || '').trim();

  const buffers = [];
  const append = (buf) => buffers.push(Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8'));

  // 1. Initialize
  append(CMD.INIT);

  // 2. Brand Title (Double height, Centered)
  append(CMD.ALIGN_CENTER);
  append(CMD.TEXT_DOUBLE);
  append(CMD.TEXT_BOLD_ON);
  append(`${brandName}\n`);
  append(CMD.TEXT_NORMAL);
  append(CMD.TEXT_BOLD_OFF);

  // 3. KOT Badge (Inverted background)
  append(CMD.INVERT_ON);
  append(CMD.TEXT_BOLD_ON);
  append('  KITCHEN ORDER TICKET (KOT)  \n');
  append(CMD.INVERT_OFF);
  append(CMD.TEXT_BOLD_OFF);

  // 4. Solid separator
  append(CMD.ALIGN_LEFT);
  append(makeDivider('='));

  // 5. Table Name (Extra Large, Centered)
  append(CMD.ALIGN_CENTER);
  append(CMD.TEXT_DOUBLE);
  append(CMD.TEXT_BOLD_ON);
  append(`${tableName}\n`);
  append(CMD.TEXT_NORMAL);
  append(CMD.TEXT_BOLD_OFF);

  // 6. Meta details (Date, Time, Customer)
  append(CMD.ALIGN_LEFT);
  append(padLine(`Date: ${dateStr}`, `Time: ${timeStr}`));
  append(`Name: ${customerName}\n`);
  append(makeDivider('-'));

  // 7. Items Header
  append(CMD.TEXT_BOLD_ON);
  append(padLine('ITEM', 'QTY'));
  append(CMD.TEXT_BOLD_OFF);
  append(makeDivider('-'));

  // 8. Item rows
  let totalQty = 0;
  (data.items || []).forEach((item) => {
    const qty = item.quantity || 1;
    totalQty += qty;
    const name = item.name || 'Item';
    append(CMD.TEXT_BOLD_ON);
    append(padLine(name, `x ${qty}`));
    append(CMD.TEXT_BOLD_OFF);
    if (item.notes) {
      append(`  * Note: ${item.notes}\n`);
    }
  });

  append(makeDivider('-'));

  // 9. Totals summary
  append(CMD.TEXT_BOLD_ON);
  append(padLine(`Total Items: ${(data.items || []).length}`, `Total Qty: ${totalQty}`));
  append(CMD.TEXT_BOLD_OFF);
  append(makeDivider('='));

  // 10. Special Table Notes / Instructions (if any)
  if (notes) {
    append(CMD.TEXT_BOLD_ON);
    append('*** SPECIAL INSTRUCTIONS ***\n');
    append(CMD.TEXT_BOLD_OFF);
    append(`${notes}\n`);
    append(makeDivider('-'));
  }

  // 11. Footer
  append(CMD.ALIGN_CENTER);
  append(CMD.TEXT_BOLD_ON);
  append('*** SEND TO KITCHEN ***\n');
  append(CMD.TEXT_BOLD_OFF);
  append(`Printed: ${dateStr} ${timeStr}\n`);

  // 12. Feed paper and auto-cut
  append(CMD.FEED_LINES(4));
  if (config.autoCut) {
    append(CMD.FULL_CUT);
  }

  // 13. Optional kitchen buzzer beep
  if (config.beepOnPrint) {
    append(CMD.BEEP);
  }

  return Buffer.concat(buffers);
}

/**
 * Builds a quick test print slip for RETSOL RTP-82UW
 */
function buildTestEscPos(ip, port) {
  const buffers = [];
  const append = (buf) => buffers.push(Buffer.isBuffer(buf) ? buf : Buffer.from(buf, 'utf8'));

  append(CMD.INIT);
  append(CMD.ALIGN_CENTER);
  append(CMD.TEXT_DOUBLE);
  append(CMD.TEXT_BOLD_ON);
  append('RETSOL RTP-82UW\n');
  append(CMD.TEXT_NORMAL);
  append(CMD.TEXT_BOLD_OFF);
  append('3" Wi-Fi Thermal Receipt Printer\n');
  append(makeDivider('='));

  append(CMD.ALIGN_LEFT);
  append(CMD.TEXT_BOLD_ON);
  append('CONNECTION TEST: SUCCESSFUL!\n');
  append(CMD.TEXT_BOLD_OFF);
  append(`Printer IP   : ${ip}\n`);
  append(`Printer Port : ${port}\n`);
  append(`Printer Mode : RAW TCP ESC/POS\n`);
  append(`Test Time    : ${new Date().toLocaleString('en-IN')}\n`);
  append(makeDivider('-'));

  append(CMD.ALIGN_CENTER);
  append('JB PAVILION & CAFE\n');
  append('Wi-Fi KOT Printing System Active\n');

  append(CMD.FEED_LINES(4));
  append(CMD.FULL_CUT);
  append(CMD.BEEP);

  return Buffer.concat(buffers);
}

/**
 * Sends raw ESC/POS Buffer directly to printer IP via TCP Socket on Port 9100
 */
function sendToPrinter(rawBuffer, targetIp, targetPort) {
  return new Promise((resolve, reject) => {
    const ip = targetIp || config.printerIp;
    const port = targetPort || config.printerPort;

    console.log(`[Printer] Connecting to RETSOL RTP-82UW at ${ip}:${port}...`);
    const socket = new net.Socket();
    socket.setTimeout(6000);

    socket.connect(port, ip, () => {
      console.log(`[Printer] Connected! Sending ${rawBuffer.length} bytes...`);
      socket.write(rawBuffer, () => {
        console.log('[Printer] Data sent successfully. Closing socket.');
        socket.end();
        resolve({ success: true, message: `Printed successfully to RETSOL RTP-82UW (${ip}:${port})` });
      });
    });

    socket.on('timeout', () => {
      console.error(`[Printer] Connection timed out (${ip}:${port})`);
      socket.destroy();
      reject(new Error(`Connection to printer at ${ip}:${port} timed out. Make sure the printer is turned on and connected to the same Wi-Fi router.`));
    });

    socket.on('error', (err) => {
      console.error(`[Printer] Socket error: ${err.message}`);
      reject(new Error(`Printer error (${ip}:${port}): ${err.message}`));
    });
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS & Private Network Access Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      model: 'RETSOL RTP-82UW',
      printerIp: config.printerIp,
      printerPort: config.printerPort,
      serverPort: config.serverPort,
    }));
    return;
  }

  // Test print endpoint
  if (req.method === 'POST' && req.url === '/test-print') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const targetIp = payload.printerIp || config.printerIp;
        const targetPort = payload.printerPort || config.printerPort;

        if (payload.printerIp && payload.printerIp !== config.printerIp) {
          config.printerIp = payload.printerIp;
          saveConfig();
        }

        const testBuf = buildTestEscPos(targetIp, targetPort);
        await sendToPrinter(testBuf, targetIp, targetPort);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Test print successful on RETSOL RTP-82UW (${targetIp}:${targetPort})`,
          printerIp: targetIp,
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
        }));
      }
    });
    return;
  }

  // Print KOT endpoint
  if (req.method === 'POST' && req.url === '/print-kot') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const kotData = payload.kotData || payload;
        const targetIp = payload.printerIp || config.printerIp;
        const targetPort = payload.printerPort || config.printerPort;

        if (payload.printerIp && payload.printerIp !== config.printerIp) {
          config.printerIp = payload.printerIp;
          saveConfig();
        }

        const rawBuf = buildKotEscPos(kotData);
        await sendToPrinter(rawBuf, targetIp, targetPort);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `KOT printed on RETSOL RTP-82UW (${targetIp}:${targetPort})`,
          printerIp: targetIp,
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
        }));
      }
    });
    return;
  }

  // Update Config
  if (req.method === 'POST' && req.url === '/config') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.printerIp) config.printerIp = payload.printerIp;
        if (payload.printerPort) config.printerPort = parseInt(payload.printerPort, 10);
        if (typeof payload.beepOnPrint === 'boolean') config.beepOnPrint = payload.beepOnPrint;
        if (typeof payload.autoCut === 'boolean') config.autoCut = payload.autoCut;
        saveConfig();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, config }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(config.serverPort, () => {
  console.log('===============================================================');
  console.log('  RETSOL RTP-82UW Wi-Fi Print Bridge - JB Pavilion & Cafe');
  console.log('===============================================================');
  console.log(`[Bridge Server] Running on http://localhost:${config.serverPort}`);
  console.log(`[Target Printer] RETSOL RTP-82UW @ ${config.printerIp}:${config.printerPort}`);
  console.log('Endpoints:');
  console.log(`  - Health Check : GET  http://localhost:${config.serverPort}/health`);
  console.log(`  - Test Print   : POST http://localhost:${config.serverPort}/test-print`);
  console.log(`  - Print KOT    : POST http://localhost:${config.serverPort}/print-kot`);
  console.log('===============================================================');
  console.log('Ready to receive print jobs from Waiter Mobiles & POS PC...\n');
});
