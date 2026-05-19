/**
 * Defines animation behavior for an element or page.
 */
export interface Animation {
  /** Unique identifier for the animation record */
  id: string;
  
  /** What causes the animation to start */
  trigger: 'onLoad' | 'onScroll' | 'onHover' | 'onClick' | 'whileInView';
  
  /** The animation preset or type */
  type: 
    | 'fadeIn' | 'fadeOut' 
    | 'slideIn' | 'slideOut' 
    | 'scaleIn' | 'scaleOut' 
    | 'rotateIn' 
    | 'bounceIn' 
    | 'flipIn' 
    | 'pulse' 
    | 'shake' 
    | 'glow' 
    | 'typewriter' 
    | 'blur' 
    | 'reveal'
    | 'parachute'
    | 'perspectiveFlip'
    | 'tilt'
    | 'custom';

  /** Primary movement direction if applicable */
  direction?: 'up' | 'down' | 'left' | 'right';
  
  /** Total time for one animation cycle in ms */
  duration: number;
  
  /** Delay before animation starts in ms */
  delay: number;
  
  /** Easing curve for the movement */
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'bounce';
  
  /** How many times to repeat (0 = infinite) */
  repeat: number;
  
  /** Stagger delay between child elements in a container (ms) */
  stagger?: number;
  
  /** Custom keyframe definitions for 'custom' type */
  keyframes?: Array<{
    /** 0 to 1 position in animation duration */
    offset: number;
    /** Style properties at this keyframe (CSS-compatible). */
    style: Record<string, string | number>;
  }>;
}
