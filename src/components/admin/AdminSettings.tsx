import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Coffee, RotateCcw, Shield, Check, Info, Printer, Wifi, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { sendTestPrintToWifi } from '../../utils/wifiPrint';

export const AdminSettings: React.FC = () => {
  const { resetDemoData, settings, updateSettings, currentRole } = useCafe();
  const isKunafaAdmin = currentRole === 'admin_kunafa';
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  const [profile, setProfile] = useState(settings);

  // Sync profile when settings from DB changes (e.g. initial load)
  React.useEffect(() => {
    if (settings) setProfile(settings);
  }, [settings]);

  const [isSaving, setIsSaving] = useState(false);
  const [testPrintStatus, setTestPrintStatus] = useState<{ loading: boolean; message?: string; success?: boolean } | null>(null);

  const handleSaveProfile = () => {
    setIsSaving(true);
    updateSettings(profile);
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  const handleTestPrint = async () => {
    setTestPrintStatus({ loading: true });
    const res = await sendTestPrintToWifi(profile.printBridgeUrl, profile.printerIp, profile.printerPort);
    setTestPrintStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
    setTimeout(() => {
      setTestPrintStatus(null);
    }, 6000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">SETTINGS & PREFERENCES</h2>
        <p className="text-xs text-stone-500">Café profile, localized currency, and demo environment reset</p>
      </div>

      {/* Café Profile Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>Café Profile</span>
          </h3>
          {!isKunafaAdmin && (
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-500 font-semibold mb-1">Café Name</label>
            <input
              type="text"
              value={profile.cafeName}
              onChange={(e) => setProfile({ ...profile, cafeName: e.target.value })}
              disabled={isKunafaAdmin}
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Upload Logo</label>
            <div className="flex items-center space-x-3">
              {profile.logoUrl && (
                <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 p-1 shrink-0 overflow-hidden shadow-xs">
                  <img src={profile.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProfile({ ...profile, logoUrl: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={isKunafaAdmin}
                className={`w-full text-sm text-stone-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border file:border-amber-300 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 file:cursor-pointer transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Currency Symbol</label>
            <input
              type="text"
              value={profile.currencySymbol}
              onChange={(e) => setProfile({ ...profile, currencySymbol: e.target.value })}
              disabled={isKunafaAdmin}
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Outlet Terminal</label>
            <input
              type="text"
              value={profile.outletTerminal}
              onChange={(e) => setProfile({ ...profile, outletTerminal: e.target.value })}
              disabled={isKunafaAdmin}
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Tax / GST Configuration</label>
            <input
              type="text"
              value={profile.taxConfig}
              onChange={(e) => setProfile({ ...profile, taxConfig: e.target.value })}
              disabled={isKunafaAdmin}
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${isKunafaAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* RETSOL RTP-82UW Wi-Fi Thermal Printer Card */}
      {!isKunafaAdmin && (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-stone-900 text-sm">
                  Wi-Fi Kitchen Printer (RETSOL RTP-82UW)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  80mm / 3" Thermal
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Direct silent printing over local Wi-Fi network (Port 9100 ESC/POS).
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              {isSaving ? 'Saving...' : 'Save Printer'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-600 font-bold mb-1 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-amber-600" />
                <span>Printer IP Address</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 192.168.1.100"
                value={profile.printerIp || ''}
                onChange={(e) => setProfile({ ...profile, printerIp: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Local Wi-Fi IP of the RETSOL RTP-82UW printer
              </span>
            </div>

            <div>
              <label className="block text-stone-600 font-bold mb-1">RAW Port (Default: 9100)</label>
              <input
                type="number"
                placeholder="9100"
                value={profile.printerPort || 9100}
                onChange={(e) => setProfile({ ...profile, printerPort: Number(e.target.value) || 9100 })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Standard ESC/POS TCP port (9100)
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-600 font-bold mb-1">Print Bridge Server URL</label>
              <input
                type="text"
                placeholder="http://localhost:8080"
                value={profile.printBridgeUrl || 'http://localhost:8080'}
                onChange={(e) => setProfile({ ...profile, printBridgeUrl: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Address of the local bridge on your PC (started with start-wifi-printer.bat)
              </span>
            </div>
          </div>

          {/* Test Print Button & Status */}
          <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestPrint}
              disabled={testPrintStatus?.loading}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              {testPrintStatus?.loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to RETSOL...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Print to RETSOL Printer</span>
                </>
              )}
            </button>

            {testPrintStatus?.message && (
              <div
                className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold ${
                  testPrintStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {testPrintStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{testPrintStatus.message}</span>
              </div>
            )}
          </div>

          {/* RETSOL RTP-82UW Quick IP Guide */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>How to find your RETSOL RTP-82UW Printer's Wi-Fi IP Address:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-amber-900/90 pl-1">
              <li>Turn <strong>OFF</strong> the printer using the front power switch.</li>
              <li>Press and <strong>HOLD</strong> the <strong>FEED</strong> button on top of the printer.</li>
              <li>Turn the power switch <strong>ON</strong> while continuing to hold the FEED button.</li>
              <li>Release the button after 2 seconds. The printer will print a test ticket showing the <strong>IP Address</strong> (e.g. 192.168.1.100).</li>
              <li>Type that IP in the box above, click <strong>Save Printer</strong>, and tap <strong>Send Test Print</strong>!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Seed Materials Card - Hidden for Kunafa Admin */}
      {!isKunafaAdmin && (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Seed Required Materials</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md">
                Automatically creates all the required materials (Coffee, Milk, Sugar, etc.) needed by your current Menu Items, so you don't have to add them one by one.
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                const { doc, setDoc, getDocs, collection, deleteDoc } = await import('firebase/firestore');
                const { db } = await import('../../firebase');
                
                // Clear old stockItems collection
                const oldSnap = await getDocs(collection(db, 'stockItems'));
                await Promise.all(oldSnap.docs.map(d => deleteDoc(d.ref)));
                
                // Clear materials and stockBalances just in case
                const oldMaterials = await getDocs(collection(db, 'materials'));
                await Promise.all(oldMaterials.docs.map(d => deleteDoc(d.ref)));
                const oldBalances = await getDocs(collection(db, 'stockBalances'));
                await Promise.all(oldBalances.docs.map(d => deleteDoc(d.ref)));

                const requiredItems = [
                  { id: 'st-coffee', name: 'Coffee Beans', unit: 'KG', minThreshold: 2, costPerUnit: 800 },
                  { id: 'st-milk', name: 'Milk', unit: 'L', minThreshold: 10, costPerUnit: 60 },
                  { id: 'st-sugar', name: 'Sugar', unit: 'KG', minThreshold: 5, costPerUnit: 45 },
                  { id: 'st-lemons', name: 'Fresh Lemons & Mint', unit: 'KG', minThreshold: 1, costPerUnit: 120 },
                  { id: 'st-tea', name: 'Tea Leaves', unit: 'KG', minThreshold: 1, costPerUnit: 600 },
                  { id: 'st-bread', name: 'Bread', unit: 'Packs', minThreshold: 5, costPerUnit: 40 },
                  { id: 'st-cheese', name: 'Cheese', unit: 'KG', minThreshold: 2, costPerUnit: 450 },
                  { id: 'st-potatoes', name: 'Potatoes', unit: 'KG', minThreshold: 10, costPerUnit: 30 },
                  { id: 'st-chocolate', name: 'Cocoa & Brownie Mix', unit: 'KG', minThreshold: 2, costPerUnit: 500 },
                  { id: 'st-icecream', name: 'Vanilla Ice Cream', unit: 'L', minThreshold: 2, costPerUnit: 200 },
                ];
                for (const item of requiredItems) {
                  // Insert into materials
                  await setDoc(doc(db, 'materials', item.id), item);
                  // Insert into stockBalances
                  await setDoc(doc(db, 'stockBalances', item.id), {
                    id: item.id,
                    materialId: item.id,
                    available: 0,
                    status: 'out',
                    lastRestocked: new Date().toISOString().split('T')[0]
                  });
                }
                alert('Successfully seeded all required materials and stock balances!');
              } catch (err) {
                console.error(err);
                alert('Failed to seed materials');
              }
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2 transition-colors active:scale-95"
          >
            <Check className="w-4 h-4 text-emerald-100" />
            <span>Seed Materials Now</span>
          </button>
        </div>
      )}

    </div>
  );
};
