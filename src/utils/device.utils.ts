import UAParser from 'ua-parser-js';

export const parseDevice = (userAgent: string) => {
  const parser = new UAParser(userAgent);

  const os = parser.getOS();
  const browser = parser.getBrowser();
  const device = parser.getDevice();

  let type: 'desktop' | 'tablet' | 'mobile' = 'desktop';

  if (device.type === 'mobile') type = 'mobile';
  else if (device.type === 'tablet') type = 'tablet';

  return {
    type,
    os: os.name || 'Desconocido',
    browser: browser.name || 'Desconocido',
    deviceName: device.model || os.name || 'Dispositivo',
  };
};