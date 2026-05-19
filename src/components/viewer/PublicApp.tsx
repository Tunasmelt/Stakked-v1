/* src/components/viewer/PublicApp.tsx */
'use client';

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { StakkedProject } from '@/types/project';
import { ViewerCanvas } from './ViewerCanvas';
import { Loader2 } from 'lucide-react';

interface Props {
  project: StakkedProject;
}

/**
 * PublicApp
 * ---------
 * Hydrates the global ProjectStore with the published snapshot, then
 * renders the ViewerCanvas. This ensures all sub-components that rely
 * on useProjectStore (like CanvasElement) work out of the box.
 */
export default function PublicApp({ project }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const loadProject = useProjectStore((s) => s.loadProject);

  useEffect(() => {
    loadProject(project);
    requestAnimationFrame(() => {
      setHydrated(true);
    });
  }, [project, loadProject]);

  if (!hydrated) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        background: '#09090b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white'
      }}>
        <Loader2 className="stakked-spinning" size={32} opacity={0.5} />
        <style>{`@keyframes stakked-spin { to { transform: rotate(360deg); } } .stakked-spinning { animation: stakked-spin 1s linear infinite; }`}</style>
      </div>
    );
  }

  return <ViewerCanvas project={project} />;
}
