'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import TextElement from './TextElement';
import ImageElement from './ImageElement';
import ButtonElement from './ButtonElement';
import VideoElement from './VideoElement';
import DividerElement from './DividerElement';
import EmbedElement from './EmbedElement';
import GalleryElement from './GalleryElement';
import IconElement from './IconElement';
import ShapeElement from './ShapeElement';
import ContainerElement from './ContainerElement';
import LineElement from './LineElement';
import DrawingElement from './DrawingElement';
import TableElement from './TableElement';
import ProgressElement from './ProgressElement';
import CountdownElement from './CountdownElement';
import CodeElement from './CodeElement';

interface RendererProps {
  element: StakkedElement;
  isSelected: boolean;
  isEditing: boolean;
}

/**
 * ElementRenderer: Switches between specific component renderers based on element type.
 * Ensures that props are passed correctly and defaults are handled.
 */
export function ElementRenderer({ element, isSelected, isEditing }: RendererProps) {
  const props = { element, isSelected, isEditing };

  switch (element.type) {
    case 'text': return <TextElement {...props} />;
    case 'image': return <ImageElement {...props} />;
    case 'button': return <ButtonElement {...props} />;
    case 'video': return <VideoElement {...props} />;
    case 'divider': return <DividerElement {...props} />;
    case 'embed': return <EmbedElement {...props} />;
    case 'gallery': return <GalleryElement {...props} />;
    case 'icon': return <IconElement {...props} />;
    case 'shape': return <ShapeElement {...props} />;
    case 'container': return <ContainerElement {...props} />;
    case 'line': return <LineElement {...props} />;
    case 'drawing': return <DrawingElement {...props} />;
    case 'table': return <TableElement element={element} isEditing={isEditing} />;
    case 'progress': return <ProgressElement element={element} isEditing={isEditing} />;
    case 'countdown': return <CountdownElement element={element} isEditing={isEditing} />;
    case 'code': return <CodeElement element={element} isEditing={isEditing} />;
    default:
      return (
        <div style={{ padding: '10px', background: '#333', color: '#fff', fontSize: '10px' }}>
          Renderer not found: {element.type}
        </div>
      );
  }
}
