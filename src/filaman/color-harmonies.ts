export const harmonyModes = ['similar', 'complementary', 'analogous', 'triadic', 'split-complementary'] as const;
type HarmonyMode = typeof harmonyModes[number];

type WheelOptions = {
  referenceHex: string;
  candidates: readonly {id: string; hexes: readonly string[]}[];
  modes: readonly HarmonyMode[];
  mode?: HarmonyMode;
  locale: string;
  onChange: (result: HarmonyResult) => void;
};

export type HarmonyResult = {
  mode: HarmonyMode;
  referenceHex: string | null;
  groups: {
    offset: number | null;
    targetHue: number | null;
    matches: {id: string; hex: string; distance: number}[];
  }[];
};

type HarmonyModule = {
  mountColorHarmonyWheel: (container: HTMLElement, options: WheelOptions) => {
    update: (options: Partial<WheelOptions>) => void;
    destroy: () => void;
  };
};

let sharedWheel: Promise<HarmonyModule> | undefined;
export function loadColorHarmonyWheel(): Promise<HarmonyModule> {
  return sharedWheel ??= (async () => {
    const url = '/color-harmonies.js';
    const module = await import(/* @vite-ignore */ url) as HarmonyModule;
    if (typeof module.mountColorHarmonyWheel !== 'function') throw new Error('Invalid FilaMan color wheel');

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/color-harmonies.css';
    await new Promise<void>((resolve, reject) => {
      stylesheet.onload = () => resolve();
      stylesheet.onerror = () => {
        stylesheet.remove();
        reject(new Error('FilaMan color wheel stylesheet unavailable'));
      };
      document.head.append(stylesheet);
    });
    return module;
  })();
}
