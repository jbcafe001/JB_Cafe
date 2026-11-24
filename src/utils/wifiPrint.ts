import { KotData } from './kotGenerator';

export interface WifiPrintResponse {
  success: boolean;
  message: string;
  printerIp?: string;
}

const DEFAULT_BRIDGE_URL = 'http://localhost:8080';

/**
 * Checks if the local Wi-Fi Print Bridge is active and reachable.
 */
export async function checkWifiBridgeStatus(bridgeUrl?: string): Promise<boolean> {
  const url = (bridgeUrl || DEFAULT_BRIDGE_URL).replace(/\/$/, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Sends a test print command to the RETSOL RTP-82UW Wi-Fi printer via the local bridge.
 */
export async function sendTestPrintToWifi(
  bridgeUrl?: string,
  printerIp?: string,
  printerPort?: number
): Promise<WifiPrintResponse> {
  const url = (bridgeUrl || DEFAULT_BRIDGE_URL).replace(/\/$/, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`${url}/test-print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        printerIp: printerIp || undefined,
        printerPort: printerPort || 9100,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Test print sent to RETSOL RTP-82UW Wi-Fi printer successfully!',
        printerIp: data.printerIp,
      };
    }
    return {
      success: false,
      message: data.error || data.message || 'Failed to send test print to printer.',
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.name === 'AbortError'
          ? 'Connection timed out. Ensure the print bridge is running and the printer is on.'
          : 'Could not connect to Wi-Fi Print Bridge. Start "start-wifi-printer.bat" on your PC.',
    };
  }
}

/**
 * Sends KOT data to the RETSOL RTP-82UW Wi-Fi thermal printer via the print bridge.
 */
export async function sendKotToWifiPrinter(
  kotData: KotData,
  bridgeUrl?: string,
  printerIp?: string,
  printerPort?: number
): Promise<WifiPrintResponse> {
  const url = (bridgeUrl || DEFAULT_BRIDGE_URL).replace(/\/$/, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`${url}/print-kot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kotData,
        printerIp: printerIp || undefined,
        printerPort: printerPort || 9100,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || 'KOT printed on RETSOL RTP-82UW Wi-Fi printer.',
        printerIp: data.printerIp,
      };
    }
    return {
      success: false,
      message: data.error || data.message || 'Printer bridge returned error.',
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.name === 'AbortError'
          ? 'Printer response timed out.'
          : 'Wi-Fi Print Bridge not reachable.',
    };
  }
}
