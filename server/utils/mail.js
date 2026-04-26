import net from 'net';
import tls from 'tls';

const readResponse = (socket) => new Promise((resolve, reject) => {
  let buffer = '';

  const cleanup = () => {
    socket.off('data', onData);
    socket.off('error', onError);
  };

  const onError = (error) => {
    cleanup();
    reject(error);
  };

  const onData = (chunk) => {
    buffer += chunk.toString('utf8');
    const lines = buffer.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return;

    const lastLine = lines[lines.length - 1];
    const match = lastLine.match(/^(\d{3})([ -])/);
    if (!match) return;

    const code = match[1];
    const isComplete = match[2] === ' ';
    if (!isComplete) return;

    cleanup();
    resolve({ code, lines });
  };

  socket.on('data', onData);
  socket.on('error', onError);
});

const sendCommand = async (socket, command) => {
  socket.write(`${command}\r\n`);
  return readResponse(socket);
};

const getFromHeader = () => {
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'AllAvailable';
  return `${fromName} <${fromEmail}>`;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing');
  }

  const secure = process.env.SMTP_SECURE !== 'false';
  const socket = secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port });

  await new Promise((resolve, reject) => {
    socket.once('secureConnect', resolve);
    socket.once('connect', resolve);
    socket.once('error', reject);
  });

  await readResponse(socket);
  await sendCommand(socket, `EHLO ${process.env.SMTP_HELO || 'localhost'}`);
  await sendCommand(socket, 'AUTH LOGIN');
  await sendCommand(socket, Buffer.from(user).toString('base64'));
  await sendCommand(socket, Buffer.from(pass).toString('base64'));
  await sendCommand(socket, `MAIL FROM:<${process.env.SMTP_FROM || user}>`);
  await sendCommand(socket, `RCPT TO:<${to}>`);
  await sendCommand(socket, 'DATA');

  const message = [
    `From: ${getFromHeader()}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html || text || '',
    '.',
    '',
  ].join('\r\n');

  socket.write(message);
  await readResponse(socket);

  try {
    await sendCommand(socket, 'QUIT');
  } finally {
    socket.end();
  }
};
