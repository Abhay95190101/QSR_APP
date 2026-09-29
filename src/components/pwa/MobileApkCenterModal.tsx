import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  X,
  Share2,
  Flame,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface MobileApkCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const MobileApkCenterModal: React.FC<MobileApkCenterModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'qr'>('install');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pwabuilderUrl = `https://www.pwabuilder.com?site=${encodeURIComponent(currentUrl)}`;

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#1e1b19',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      onShowToast('App URL copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onShowToast('App installed successfully on your device!');
        onClose();
      }
    } else if (isIOS) {
      onShowToast('Tap Safari Share button → "Add to Home Screen"');
    } else {
      onShowToast('In Chrome/Edge: tap Menu (⋮) → "Install app" or "Add to Home Screen"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest text-on-surface rounded-3xl w-full max-w-lg shadow-2xl border border-outline-variant/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary-container to-secondary p-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-headline-md text-white font-bold leading-tight">
                  Mobile App & APK Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25 uppercase tracking-wider text-white">
                  PWA + APK
                </span>
              </div>
              <p className="text-xs text-white/85 font-medium">
                Install on Android & iOS or download standalone APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/35 text-white transition-colors relative z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-outline-variant/40 bg-surface-container-low px-4 pt-2 gap-1">
          <button
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-surface-container-lowest text-primary border-t-2 border-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>1-Tap Install</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-surface-container-lowest text-primary border-t-2 border-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>APK Package</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-surface-container-lowest text-primary border-t-2 border-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan on Phone</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-body-md text-sm">
          {/* TAB 1: 1-Tap Mobile Install */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">
                    {isInstalled
                      ? 'Already Installed on This Device'
                      : 'Native Standalone App Experience'}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Installs natively on Android (WebAPK) & iOS home screen with no app store delay.
                    Runs full-screen with offline caching, high-speed launch, and kitchen notifications.
                  </p>
                </div>
              </div>

              {/* Status & CTA Button */}
              {isInstalled ? (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-800 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">App is Installed & Active</div>
                    <div className="text-xs text-green-700">
                      Running in standalone native window mode.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstallable ? 'Install App on This Device Now' : 'Install to Home Screen'}</span>
                  </button>

                  <div className="text-center text-[11px] text-on-surface-variant">
                    {isAndroid && 'Android detects WebAPK — instantly creates a standalone APK wrapper.'}
                    {isIOS && 'On iPhone / iPad: Tap Safari Share (⬆) → "Add to Home Screen".'}
                    {!isAndroid && !isIOS && 'Supported across Chrome, Edge, Safari, Brave, and Android/iOS.'}
                  </div>
                </div>
              )}

              {/* Quick Spec checklist */}
              <div className="rounded-2xl bg-surface-container-low/70 p-3.5 border border-outline-variant/30 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  PWA Architecture Specs
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>Web App Manifest</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>Offline Service Worker</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>Maskable 512px Icons</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>Full-Screen Standalone</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android APK & Play Store Package */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary/15 text-secondary shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">
                      Generate Sideloadable Android APK / AAB
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Since this app is built with a standard compliant PWA manifest, you can generate a signed <strong>.apk</strong> or Google Play <strong>.aab</strong> package using PWABuilder or Bubblewrap CLI.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/30 space-y-2">
                  <a
                    href={pwabuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs shadow flex items-center justify-center gap-2 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Generate Android APK on PWABuilder (1-Click)</span>
                  </a>

                  <div className="text-[11px] text-on-surface-variant text-center">
                    Pre-fills this app's URL: <code className="bg-surface-container px-1.5 py-0.5 rounded text-primary font-mono text-[10px]">{currentUrl}</code>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/30 space-y-3 text-xs">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>2 Fast Methods for Android:</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </div>
                    <div>
                      <strong className="text-on-surface">Method 1 (Instant): Native WebAPK</strong>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">
                        Open this URL on Chrome/Edge on your Android phone, tap <strong>"Install App"</strong> or the prompt at the bottom. Android will automatically build and install a real WebAPK on your phone drawer!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </div>
                    <div>
                      <strong className="text-on-surface">Method 2: PWABuilder / Bubblewrap APK</strong>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">
                        Click the button above to go to PWABuilder. It analyzes the manifest, lets you download a signed debug/release <code>.apk</code> or Google Play package in 30 seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Scan QR Code on Mobile */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-4">
              <p className="text-xs text-on-surface-variant">
                Scan this QR code with your phone camera to open and install the app directly on your Android or iPhone:
              </p>

              <div className="inline-block p-4 bg-white rounded-3xl shadow-md border-2 border-outline-variant/40">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scan to open on phone"
                    className="w-48 h-48 mx-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-on-surface-variant">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs flex items-center gap-1.5 transition border border-outline-variant/40"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Direct URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'SS Cafe & Restaurant Mobile App',
                        url: currentUrl,
                      }).catch(() => {});
                    } else {
                      handleCopyLink();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs flex items-center gap-1.5 transition border border-outline-variant/40"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <Flame className="w-4 h-4 text-primary" />
            <span className="font-semibold">SS Cafe &amp; Restaurant PWA</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-bold text-on-surface transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
