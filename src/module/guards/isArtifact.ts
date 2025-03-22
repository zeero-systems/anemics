import type { ArtifactType, ScopeEnum } from '@zxxxro/commons';

export const isArtifact = (x: any): x is ArtifactType & { scope?: ScopeEnum } => {
  return x && x.name && !!x.target
};

export default isArtifact