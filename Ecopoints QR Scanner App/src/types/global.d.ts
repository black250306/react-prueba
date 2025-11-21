declare global {
  interface MediaTrackCapabilities {
    torch?: boolean;
    zoom?: {
      max: number;
      min: number;
      step: number;
    };
  }

  interface MediaTrackConstraintSet {
    torch?: boolean;
    zoom?: number;
  }
}

// This empty export is needed to treat this file as a module.
export {};
