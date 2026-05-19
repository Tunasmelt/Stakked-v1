'use client';

import React from 'react';
import { StakkedElement } from '@/types/element';
import TextElement from './TextElement';
import ImageElement from './ImageElement';
import ButtonElement from './ButtonElement';
import SocialLinkElement from './SocialLinkElement';
import MusicPlayerElement from './MusicPlayerElement';
import VideoElement from './VideoElement';
import DividerElement from './DividerElement';
import EmbedElement from './EmbedElement';
import GalleryElement from './GalleryElement';
import CountdownElement from './CountdownElement';
import IconElement from './IconElement';
import ShapeElement from './ShapeElement';
import ContainerElement from './ContainerElement';
import NavigationElement from './NavigationElement';
import FormElement from './FormElement';
import MapElement from './MapElement';
import TestimonialElement from './TestimonialElement';
import MarqueeElement from './MarqueeElement';
import AccordionElement from './AccordionElement';
import TabsElement from './TabsElement';
import LineElement from './LineElement';
import DrawingElement from './DrawingElement';

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
    case 'social-link': return <SocialLinkElement {...props} />;
    case 'music-player': return <MusicPlayerElement {...props} />;
    case 'video': return <VideoElement {...props} />;
    case 'divider': return <DividerElement {...props} />;
    case 'embed': return <EmbedElement {...props} />;
    case 'gallery': return <GalleryElement {...props} />;
    case 'countdown': return <CountdownElement {...props} />;
    case 'icon': return <IconElement {...props} />;
    case 'shape': return <ShapeElement {...props} />;
    case 'container': return <ContainerElement {...props} />;
    case 'navigation': return <NavigationElement {...props} />;
    case 'form': return <FormElement {...props} />;
    case 'map': return <MapElement {...props} />;
    case 'testimonial': return <TestimonialElement {...props} />;
    case 'marquee': return <MarqueeElement {...props} />;
    case 'accordion': return <AccordionElement {...props} />;
    case 'tabs': return <TabsElement {...props} />;
    case 'line': return <LineElement {...props} />;
    case 'drawing': return <DrawingElement {...props} />;
    default:
      return (
        <div style={{ padding: '10px', background: '#333', color: '#fff', fontSize: '10px' }}>
          Renderer not found: {element.type}
        </div>
      );
  }
}
