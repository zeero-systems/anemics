import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import type { CommonOptionsType, FilterPredicateType } from '~/persister/types.ts';
import type { FilterType } from '~/persister/types.ts';

import { Factory } from '@zeero/commons';
import Schema from '~/persister/decorations/schema.decoration.ts';
import Column from '~/persister/decorations/column.decoration.ts';
import ForeignKey from '~/persister/decorations/foreign-key.decoration.ts';
import Repository from '~/persister/services/repository.ts';
import Many from '~/persister/decorations/many.decoration.ts';
import One from '~/persister/decorations/one.decoration.ts';
import { FilterDictionaryType } from '~/persister/types.ts';
import Filter from '~/persister/services/filter.service.ts';
import Postgresql from '~/persister/postgresql/postgresql.database.ts';

describe('persister', () => {
  @Schema('users')
  class User {
    @Column('serial', { primaryKey: true })
    id?: number;

    @Column('varchar')
    name!: string;

    @Column('varchar', { length: 10 })
    lastName!: string;

    @Many(() => Post, {
      foreignKey: 'userId',
      filter: { where: { and: [{ 'posts.status': { eq: 'active' } }] } },
    })
    posts?: Post[];
  }

  @Schema('posts')
  class Post {
    @Column('serial', { primaryKey: true })
    id?: number;

    @Column('varchar')
    title!: string;

    @Column('boolean', { default: false })
    active?: boolean;

    @Column('integer')
    @ForeignKey('users', { referenceKey: 'id', onDelete: 'cascade' })
    userId!: number;

    @Many(() => Comment, {
      foreignKey: 'postId',
      filter: { where: { and: [{ 'message': { like: '%Hello%' } }] } },
    })
    comments?: Comment[];

    @One(() => User, { localKey: 'userId' })
    user?: User;
  }

  @Schema('comments')
  class Comment {
    @Column('serial', { primaryKey: true })
    id?: number;

    @Column('varchar')
    message!: string;

    @Column('integer')
    @ForeignKey('users', { referenceKey: 'id', onDelete: 'cascade' })
    userId!: number;

    @Column('integer')
    @ForeignKey('posts', { referenceKey: 'id', onDelete: 'cascade' })
    postId!: number;
  }

  const commonOptions: CommonOptionsType = {
    name: 'fake',
    naming: {} as any,
    placeholder: '$',
    placeholderType: 'counter',
    syntax: 'postgresql',
  };

  const clientOptions = {
    database: 'postgres',
    hostname: 'localhost',
    password: 'postgres',
    port: 5432,
    schema: 'public',
    user: 'postgres',
  };

  const database = new Postgresql(commonOptions, clientOptions);
  const userRepository = new Repository(User, database);
  const postRepository = new Repository(Post, database);
  const commentRepository = new Repository(Comment, database);

  it('repository create tables', async () => {
    await userRepository.table.create();
    await postRepository.table.create();
    await commentRepository.table.create();
  });
  let userC: any;
  it('repository insert records', async () => {
    const userA = Factory.properties(User, { name: 'Eduardo', lastName: 'Segura' });
    const userB = Factory.properties(User, { name: 'Maximiliano', lastName: 'Bitencourt' });
    userC = Factory.properties(User, { name: 'Andres', lastName: 'ooops' });

    const userCreateResults = await userRepository.query.createMany([userA, userB, userC]);
    expect(userCreateResults.length).toEqual(3);

    userC = userCreateResults[2];

    let lastActive = true;
    for (const userResult of userCreateResults) {
      const post = Factory.properties(Post, {
        userId: userResult.id as number,
        title: `Test-${Date.now()}`,
        active: lastActive = !lastActive,
      });

      const postCreateResult = await postRepository.query.create(post);

      expect(postCreateResult.id).toBeDefined();

      if (userResult.id && postCreateResult.id) {
        const commentA = Factory.properties(Comment, {
          message: `Hello from ${Date.now()}`,
          userId: userResult.id,
          postId: postCreateResult.id,
        });

        const commentCreateResult = await commentRepository.query.create(commentA);

        expect(commentCreateResult.id).toBeDefined();
      }
    }
  });

  it('repository search records', async () => {
    const postsFilter: FilterType = {
      select: { title: 'string', id: 'number', active: 'boolean', comments: true, user: true },
      where: { or: [{ active: { eq: false } }] },
      order: { id: 'desc' },
    };

    const options: FilterType = {
      select: { name: 'string', lastName: 'string', posts: postsFilter },
    };

    const userResults = await userRepository.query.search(options);

    expect(userResults.length).toBeGreaterThan(0);
  });

  it('repository update records', async () => {
    const userAreateResult = await userRepository.query.update({ id: userC.id, lastName: 'Castro' });

    expect(userAreateResult.id).toBe(userC.id);
  });

  it('repository delete records', async () => {
    const deleteFilter: FilterPredicateType = { and: [{ lastName: { eq: 'Castro' } }] };
    const userDeleteResult = await userRepository.query.delete(deleteFilter, { returns: ['id'] });

    expect(userDeleteResult.id).not.toBeUndefined();
  });

  it('repository drop tables', async () => {
    const postDrop = await postRepository.table.drop('cascade');
    const userDrop = await userRepository.table.drop('cascade');
    const commentDrop = await commentRepository.table.drop('cascade');

    expect(userDrop).toEqual(true);
    expect(postDrop).toEqual(true);
    expect(commentDrop).toEqual(true);
  });

  it('filter to string and back', () => {
    const filter: FilterType = {
      select: {
        id: 'string',
        name: 'string',
        title: 'string',
        users: {
          select: { login: 'string', email: 'string' },
          where: { and: [{ active: { eq: 'true' } }] },
        },
      },
      where: {
        and: [
          { title: { eq: 'Test-1700884873036' } },
          { 'users.tries': { gt: 0, lt: 10 } },
        ],
        or: [
          { name: { eq: 'se' } },
          { name: { 'not in': ['a', 'b'] } },
          { and: [{ userId: { eq: 1 }, name: { like: 'du' } }] },
          { and: [{ userId: { eq: 2 } }] },
        ],
      },
      order: { id: 'desc' },
      group: ['name', 'title'],
    };

    const dictionary: FilterDictionaryType = {
      delimiter: { start: '(', end: ')', array: ',', item: ';', value: ':' },
      key: { query: 'q', select: 's', where: 'w', group: 'g', order: 'r', limit: 'l', offset: 'f', and: 'a', or: 'o', entity: 'e' },
      value: { ascend: 'c', descend: 'd', number: 'n', string: 't', boolean: 'b' },
    };

    const f = new Filter(dictionary);

    const result = f.toString(filter);

    expect(result).toEqual(
      `${dictionary.key.query}${dictionary.delimiter?.start}${dictionary.key.select}${dictionary.delimiter?.start}id${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter.item}name${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter.item}title${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter.item}users${dictionary.delimiter?.value}${dictionary.key.query}${dictionary.delimiter?.start}${dictionary.key.select}${dictionary.delimiter?.start}login${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter.item}email${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter?.end}${dictionary.key.where}${dictionary.delimiter?.start}${dictionary.key.and}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}active${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}true${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.key.where}${dictionary.delimiter?.start}${dictionary.key.and}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}title${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}Test-1700884873036${dictionary.delimiter?.end}${dictionary.key.entity}${dictionary.delimiter?.start}users.tries${dictionary.delimiter?.value}gt${dictionary.delimiter?.value}0${dictionary.delimiter?.value}lt${dictionary.delimiter?.value}10${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.key.or}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}name${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}se${dictionary.delimiter?.end}${dictionary.key.entity}${dictionary.delimiter?.start}name${dictionary.delimiter?.value}not in${dictionary.delimiter?.value}a${dictionary.delimiter?.array}b${dictionary.delimiter?.end}${dictionary.key.and}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}userId${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}1${dictionary.delimiter.item}name${dictionary.delimiter?.value}like${dictionary.delimiter?.value}du${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.key.and}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}userId${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}2${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.key.order}${dictionary.delimiter?.start}id${dictionary.delimiter?.value}${dictionary.value.descend}${dictionary.delimiter?.end}${dictionary.key.group}${dictionary.delimiter?.start}name${dictionary.delimiter.item}title${dictionary.delimiter?.end}${dictionary.delimiter?.end}`,
    );

    const q = f.toFilter(result);

    expect(q).toEqual(filter);
  });
});
