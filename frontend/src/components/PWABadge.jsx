import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PWABadge() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[100] p-4 bg-[#1f2937] rounded-xl shadow-2xl border border-gray-700 flex flex-col gap-3 max-w-sm">
      <div className="text-sm font-medium text-white">
        ✨ A new version of Campus Lost & Found is available!
      </div>
      <div className="flex gap-2">
        <button className="btn-primary py-2 px-4 text-sm" onClick={() => updateServiceWorker(true)}>
          Update App
        </button>
        <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors" onClick={close}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default PWABadge;
