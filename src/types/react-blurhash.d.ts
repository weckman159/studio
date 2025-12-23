// src/types/react-blurhash.d.ts
declare module 'react-blurhash' {
  import * as React from 'react';

  export interface BlurhashProps extends React.HTMLAttributes<HTMLDivElement> {
    hash: string;
    height?: number | string;
    width?: number | string;
    punch?: number;
  }

  export const Blurhash: React.FunctionComponent<BlurhashProps>;
}
