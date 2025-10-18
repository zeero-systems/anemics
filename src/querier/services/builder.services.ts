import { ClauseType } from '~/querier/types.ts';

export class Builder {
  public static sorter(
    clauses: Array<{ previous?: ClauseType; current: ClauseType }>,
    clauseNames: Array<string>,
  ): Array<ClauseType> {
    const ordered: Array<ClauseType> = [];
    const wasOrdered = new Set<number>();

    if (
      clauses.length > 0 &&
      clauses[0].current.name === 'Raw'
    ) {
      ordered.push(clauses[0].current);
      wasOrdered.add(0);
    }

    for (const name of clauseNames) {
      let idx = 0;
      while (idx < clauses.length) {
        if (
          !wasOrdered.has(idx) &&
          clauses[idx].current.name === name
        ) {
          ordered.push(clauses[idx].current);
          wasOrdered.add(idx);

          let rawIdx = 0;
          while (rawIdx < clauses.length) {
            if (
              !wasOrdered.has(rawIdx) &&
              clauses[rawIdx].current.name === 'Raw' &&
              clauses[rawIdx].previous &&
              clauses[rawIdx].previous === clauses[idx].current
            ) {
              ordered.push(clauses[rawIdx].current);
              wasOrdered.add(rawIdx);
            }
            rawIdx++;
          }
        }
        idx++;
      }
    }

    return ordered;
  }
}

export default Builder;
