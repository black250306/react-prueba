interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
    focusMode?: string[];
    focusDistance?: {
        min: number;
        max: number;
        step: number;
    };
    zoom?: {
        min: number;
        max: number;
        step: number;
    };
}
