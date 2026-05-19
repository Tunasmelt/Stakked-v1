'use client';

import React from 'react';
import { CommandPalette } from '@/components/system/CommandPalette';
import { SettingsModal } from '@/components/system/SettingsModal';
import { SystemDialog } from '@/components/system/SystemDialog';
import { ToastStack } from '@/components/system/ToastStack';

export function GlobalModals() {
  return (
    <>
      <CommandPalette />
      <SettingsModal />
      <SystemDialog />
      <ToastStack />
    </>
  );
}
