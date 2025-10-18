import type { FilterInterface } from '~/persister/interfaces.ts';
import type { FilterDictionaryType, FilterPredicateType, FilterSelectType, FilterType } from '~/persister/types.ts';

import { isString } from '@zeero/commons/guards';

export class Filter implements FilterInterface {
  public dictionary: FilterDictionaryType = {
    delimiter: { start: '(', end: ')', array: ',', item: ';', value: ':' },
    key: { query: 'q', select: 's', where: 'w', group: 'g', order: 'r', and: 'a', or: 'o', entity: 'e' },
    value: { ascend: 'c', descend: 'd', number: 'n', string: 't', boolean: 'b' },
  };

  constructor(dictionary?: Partial<FilterDictionaryType>) {
    this.dictionary = { ...this.dictionary, ...dictionary };
  }

  public toString(search: FilterType): string {
    return `${this.dictionary.key.query}${this.dictionary.delimiter.start}${
      [
        search.select ? this.toSelectString(search.select) : null,
        search.where ? this.toWhereString(search.where) : null,
        search.order ? this.toOrderString(search.order) : null,
        search.group ? this.toGroupString(search.group) : null,
      ].filter(Boolean).join('')
    }${this.dictionary.delimiter.end}`;
  }

  protected toSelectString(select?: FilterSelectType | string): string {
    if (!select) return '*';
    if (isString(select)) return select;

    let text = '';
    for (const [key, type] of Object.entries(select)) {
      if (text) text += this.dictionary.delimiter.item;
      if (typeof type === 'object') text += `${key}${this.dictionary.delimiter.value}${this.toString(type)}` as any;
      if (type === true) text += `${key}${this.dictionary.delimiter.value}${this.toString({ select: '*' })}` as any;
      if (type === 'string') text += `${key}${this.dictionary.delimiter.value}${this.dictionary.value.string}`;
      if (type === 'number') text += `${key}${this.dictionary.delimiter.value}${this.dictionary.value.number}`;
      if (type === 'boolean') text += `${key}${this.dictionary.delimiter.value}${this.dictionary.value.boolean}`;
    }
    return `${this.dictionary.key.select}${this.dictionary.delimiter.start}${text}${this.dictionary.delimiter.end}`;
  }

  protected toWhereString(predicate: FilterPredicateType, isRecursion?: boolean): string {
    let text = '';
    let keyText = '';
    for (const [key, possiblePredicate] of Object.entries(predicate)) {
      if (['and', 'or'].includes(key)) {
        if (key == 'or') text += `${this.dictionary.key.or}${this.dictionary.delimiter.start}`;
        if (key == 'and') text += `${this.dictionary.key.and}${this.dictionary.delimiter.start}`;

        let typeText = '';
        for (const type of possiblePredicate as any) {
          const toString = this.toWhereString(type, true);

          if (toString[0] === `${this.dictionary.key.or}${this.dictionary.delimiter.start}`) {
            typeText += toString;
          } else {
            typeText += toString;
          }
        }
        text += `${typeText}${this.dictionary.delimiter.end}`;
      } else {
        if (keyText) keyText += this.dictionary.delimiter.item;
        let insideText = '';
        for (const [operator, value] of Object.entries(possiblePredicate)) {
          if (insideText) insideText += this.dictionary.delimiter.value;
          if (Array.isArray(value)) {
            insideText += `${operator}${this.dictionary.delimiter.value}${value.join(this.dictionary.delimiter.array)}`;
          } else {
            insideText += `${operator}${this.dictionary.delimiter.value}${value}`;
          }
        }
        keyText += `${key}${this.dictionary.delimiter.value}${insideText}`;
      }
    }

    text += keyText
      ? `${this.dictionary.key.entity}${this.dictionary.delimiter.start}${keyText}${this.dictionary.delimiter.end}`
      : keyText;

    if (!isRecursion && text) {
      text = `${this.dictionary.key.where}${this.dictionary.delimiter.start}${text}${this.dictionary.delimiter.end}`;
    }

    return text;
  }

  protected toOrderString(order: { [key: string | number]: 'desc' | 'asc' }): string {
    return `${this.dictionary.key.order}${this.dictionary.delimiter.start}${
      Object.entries(order).map(([key, value]) => {
        let type = this.dictionary.value.ascend;
        if (value == 'desc') type = this.dictionary.value.descend;
        return `${key}${this.dictionary.delimiter.value}${type}`;
      }).join(this.dictionary.delimiter.array)
    }${this.dictionary.delimiter.end}`;
  }

  protected toGroupString(group: Array<string>): string {
    return `${this.dictionary.key.group}${this.dictionary.delimiter.start}${
      group.join(this.dictionary.delimiter.item)
    }${this.dictionary.delimiter.end}`;
  }

  public toFilter(text: string): FilterType {
    let i = 0;
    let lastReference: { type: string; reference: any } = { type: 'undefined', reference: undefined };

    const cutoffs = [];
    const openPositions = [];
    const references: Array<{ type: string; reference: any }> = [];

    while (i < text.length) {
      const currentLetter = text[i];
      const previousLetter = text[i - 1];

      const lastIndex = references.length > 0 ? references.length - 1 : 0;

      if (currentLetter === this.dictionary.delimiter.start) {
        let cutoffPosition = i - 1;
        openPositions.push(i + 1);

        if (previousLetter === this.dictionary.key.select) {
          if (!references[lastIndex].reference.select) references[lastIndex].reference.select = {};

          references.push({ type: 'select', reference: references[lastIndex].reference.select });
        }

        if (previousLetter === this.dictionary.key.query) {
          if (references[lastIndex]?.type == 'select') {
            let lastLetter = '';
            let propertyKey = '';
            let counter = 0;

            while (lastLetter != this.dictionary.delimiter.item) {
              counter++;
              if (
                ![
                  this.dictionary.delimiter.start,
                  this.dictionary.key.query,
                  this.dictionary.delimiter.value,
                ].includes(lastLetter)
              ) {
                propertyKey = `${lastLetter}${propertyKey}`;
              }
              lastLetter = text[i - counter];
            }

            cutoffPosition = i - counter;

            references[lastIndex].reference[propertyKey] = {};
            references.push({ type: 'query', reference: references[lastIndex].reference[propertyKey] });
          } else {
            references.push({ type: 'query', reference: {} });
          }
        }
        if (previousLetter === this.dictionary.key.where) {
          if (!references[lastIndex].reference) references[lastIndex].reference = {};
          if (!references[lastIndex].reference.where) references[lastIndex].reference.where = {};

          references.push({ type: 'where', reference: references[lastIndex].reference.where });
        }
        if (previousLetter === this.dictionary.key.and) {
          const predicate = { and: [] };
          if (references[lastIndex].type == 'where') {
            if (!references[lastIndex].reference.and) references[lastIndex].reference.and = predicate.and;
          }

          if (references[lastIndex].type == 'or') {
            references[lastIndex].reference.push(predicate);
          }

          references.push({ type: 'and', reference: predicate.and });
        }
        if (previousLetter === this.dictionary.key.or) {
          const predicate = { or: [] };
          if (references[lastIndex].type == 'where') {
            if (!references[lastIndex]?.reference.or) references[lastIndex].reference.or = predicate.or;
          }

          if (references[lastIndex].type == 'and') {
            references[lastIndex].reference.push(predicate);
          }

          references.push({ type: 'or', reference: predicate.or });
        }
        if (previousLetter === this.dictionary.key.entity) {
          const condition = {};
          references[lastIndex].reference.push(condition);
          references.push({ type: 'entity', reference: condition });
        }
        if (previousLetter === this.dictionary.key.order) {
          if (!references[lastIndex].reference.order) references[lastIndex].reference.order = {};
          references.push({ type: 'order', reference: references[lastIndex].reference.order });
        }
        if (previousLetter === this.dictionary.key.group) {
          if (!references[lastIndex].reference.group) references[lastIndex].reference.group = [];
          references.push({ type: 'group', reference: references[lastIndex].reference.group });
        }

        cutoffs.push(cutoffPosition);
      }

      if (currentLetter === this.dictionary.delimiter.end) {
        const endPosition = i;
        const openPosition = openPositions.pop();
        const cutoffPosition = cutoffs.pop() || 0;
        const slice = text.slice(openPosition, endPosition);

        i = cutoffPosition - 1;
        text = text.substring(0, cutoffPosition) + text.substring(endPosition + 1);

        if (references.length > 0) {
          lastReference = references.pop() as { type: string; reference: any };
        }

        if (lastReference.type == 'select') {
          const raws = slice.split(this.dictionary.delimiter.item).map((s) => s.trim());

          for (const raw of raws) {
            const [field, type] = raw.split(this.dictionary.delimiter.value).map((s) => s.trim());
            if (type === this.dictionary.value.string) {
              lastReference.reference[field] = 'string';
            }
            if (type === this.dictionary.value.number) {
              lastReference.reference[field] = 'number';
            }
            if (type === this.dictionary.value.boolean) {
              lastReference.reference[field] = 'boolean';
            }
          }
        }

        if (lastReference.type === 'entity') {
          const raws = slice.split(this.dictionary.delimiter.item).map((s) => s.trim());
          for (const raw of raws) {
            const parts = raw.split(this.dictionary.delimiter.value).map((s) => s.trim());
            const key = parts.shift() || '';

            lastReference.reference[key] = {};

            for (let index = 0; index < parts.length; index += 2) {
              const operator = parts[index];
              const value = parts[index + 1];

              let data: any = value;

              if (value.includes(this.dictionary.delimiter.array)) {
                data = value.split(this.dictionary.delimiter.array).map((v) => v.trim());
              } else {
                data = value.trim();
                if (!isNaN(Number(value))) {
                  data = Number(value);
                }
              }

              lastReference.reference[key][operator] = data;
            }
          }
        }

        if (lastReference.type === 'order') {
          const raws = slice.split(this.dictionary.delimiter.item).map((s) => s.trim());
          for (const raw of raws) {
            const [field, direction] = raw.split(this.dictionary.delimiter.value).map((s) => s.trim());
            if (direction === this.dictionary.value.descend) {
              lastReference.reference[field] = 'desc';
            }
            if (direction === this.dictionary.value.ascend) {
              lastReference.reference[field] = 'asc';
            }
          }
        }

        if (lastReference.type === 'group') {
          lastReference.reference.push(...slice.split(this.dictionary.delimiter.item).map((s) => s.trim()));
        }
      }

      i++;
    }

    return lastReference.reference;
  }
}

export default Filter;
