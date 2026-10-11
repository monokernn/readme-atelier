declare module 'subset-font' {
  export default function subsetFont(buf: Uint8Array, text: string, opts?: { targetFormat?: 'woff2' | 'woff' | 'truetype' | 'sfnt' }): Promise<Uint8Array>;
}
