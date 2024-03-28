declare module "*.svg" {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

declare module "*.mp3" {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

declare module "*.wav" {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

interface PageProps<
  TParams extends Record<string, string> = Record<string, never>,
  TSearchParams extends Record<string, string | string[]> = Record<
    string,
    string | string[]
  >
> {
  params: TParams;
  searchParams: Partial<TSearchParams>;
}
