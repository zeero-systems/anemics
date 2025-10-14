
import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import Querier from '~/querier/services/querier.service.ts';

describe('querier', () => {
  const query = new Querier({ syntax: 'postgreSQL' })
  const index = new Indexer({ syntax: 'postgreSQL' })

  it('basic query', () => {

    query
      .select.column('*').column('id').column('name')
      .from.table('users')
      .raw.value('AS u')

    expect(query.toQuery().text).toEqual('SELECT *, id, name FROM users AS u')
  })

  it('common query', () => {
    query
      .select.column('*')
      .from.table('users', 'u')
      .where.and('u.id', 'eq', 10)
      .order.desc('u.name')
    
    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u WHERE u.id = 10 ORDER BY u.name DESC')
  })

  it('with subquery', () => {
    query
      .select.column('*')
      .from.table('u', (bracket) => {
        return bracket.select.column('*').from.table('users')
      })
      .where.and('u.id', 'eq', 10)
      .order.desc('u.name')
    
    expect(query.toQuery().text).toEqual('SELECT * FROM (SELECT * FROM users) AS u WHERE u.id = 10 ORDER BY u.name DESC')
  })

  it('join query', () => {
    query
      .select.column('*')
      .from.table('users', 'u')
      .left.table('posts', 'p')
        .on.and('u.id', 'eq', 'p.userId')
      .order.desc('u.name')
    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u LEFT JOIN posts AS p ON u.id = p.userId ORDER BY u.name DESC')
  })

  it('multiple join query', () => {
    query
      .select.column('*').column('COUNT(id)')
      .from.table('users', 'u')
      .left.table('posts', 'p')
        .on.and('u.id', 'eq', 10)
      .left.table('comments', 'c')
        .using.and('u.id', 'eq', 'c.userId')
      .order.desc('u.name')

    expect(query.toQuery().text).toEqual('SELECT *, COUNT(id) FROM users AS u LEFT JOIN posts AS p ON u.id = 10 LEFT JOIN comments AS c USING u.id = c.userId ORDER BY u.name DESC')
  })

  it('with raw query', () => {
    query
      .select.column('*')
      .raw.value('FROM users AS u')
      .order.desc('u.name').asc('u.birthdate')

    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u ORDER BY u.name DESC, u.birthdate ASC')
  })

  it('only raw query', () => {
    query.raw.value('SELECT * FROM users AS u')

    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u')
  })

  it('basic index create', () => {
    index
      .create.name('idx_test')
      .on.table('users')
      .using.type('gist')
      .with.column('nome').column('id')

    expect(create.toQuery().text).toEqual('CREATE INDEX idx_test ON users USING gist (nome, id)')
  })

  // it('basic table create', () => {
  //   const create = querier.table
  //     .create.name('users')
  //       .column.name('id').numeric('BIGINT').primary().nullable(false)
  //       .column.name('wallet').numeric('MONEY').nullable(false)
  //       .column.name('first').character('VARCHAR', { length: 155 }).nullable(false)
  //       .column.name('last').character('VARCHAR', { length: 255 }).nullable(false)
  //       .column.name('birthdate').date('DATE')
  //       .column.name('hits').numeric('BIGSERIAL').default(0)
  //       .column.name('post_id').numeric('INTEGER')
  //       .constraint.name('fk_post')
  //         .foreingKey('post_id')
  //           .references('posts', { field: 'id'})
  //           .onDelete('cascade')

  //   expect(create.toQuery().text).toEqual('CREATE TABLE users (id BIGINT NOT NULL PRIMARY KEY, wallet MONEY NOT NULL, first VARCHAR(155) NOT NULL, last VARCHAR(255) NOT NULL, birthdate DATE, hits BIGSERIAL, post_id INTEGER, CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE)')
  // })

  // it('basic table drop', () => {
  //   const drop = querier.table
  //     .drop.name('users')
  //     .cascade()
    
  //   expect(drop.toQuery().text).toEqual('DROP TABLE users CASCADE')
  // })

  // it('basic insert', () => {
  //   const insert = querier.entry
  //     .insert.table('users')
  //       .column('wallet', 4.33)
  //       .column('first', '')
  //       .column('last', 'segura')
  //       .column('hits')
    
  //   expect(insert.toQuery().text).toEqual("INSERT INTO users (wallet, first, last, hits) VALUES ('4.33', 'DEFAULT', 'segura', 'DEFAULT')")
  // })

  // it('basic update', () => {
  //   const insert = querier.entry
  //     .update.table('users')
  //       .column('wallet', 5.33)
  //       .column('first', 'eduardo')
  //       .column('hits')
  //     .where.and('users.id', 'eq', 1)
    
  //   expect(insert.toQuery().text).toEqual("UPDATE users SET wallet = '5.33', first = 'eduardo', hits = 'DEFAULT' WHERE users.id = 1")
  // })

  // it('basic delete', () => {
  //   const removed = querier.entry
  //     .delete.table('users')
  //     .where.and('users.name', 'in', ["'Eduardo'", "'Segura'"])

  //   expect(removed.toQuery().text).toEqual("DELETE FROM users WHERE users.name IN ('Eduardo', 'Segura')")
  // })

  // it('filter to string and back', () => {
  //   const filter: FilterType = {
  //     select: { 
  //       id: 'string', 
  //       name: 'string', 
  //       title: 'string', 
  //       users: { 
  //         select: { login: 'string', email: 'string' },
  //         where: { and: [{ active: { eq: 'true' } }] }
  //       } 
  //     },
  //     where: {
  //       and: [
  //         { title: { eq: 'Test-1700884873036' } },
  //         { "users.tries": { gt: 0, lt: 10 } },
  //       ],
  //       or: [
  //         { name: { eq: 'se' } },
  //         { name: { "not in": ['a', 'b'] } },
  //         { and: [{ userId: { eq: 1 }, name: { like: 'du' } } ] },
  //         { and: [{ userId: { eq: 2 } } ] },
  //       ]
  //     },
  //     order: { id: 'desc' },
  //     group: ['name', 'title']
  //   }

  //   const dictionary: FilterDictionaryType = {
  //     // delimiter: { start: '[', end: ']', array: '::', item: '|', value: '/', },
  //     // key: { query: 'q', select: 'c', where: 'w', group: 'e', order: 'r', and: 't', or: 'y', entity: 'u', },
  //     // value: { ascend: 'i', descend: 'o', number: 'p', string: 'a', boolean: 's', }
  //     delimiter: { start: '(', end: ')', array: ',', item: ';', value: ':' },
  //   key: { query: 'q', select: 's', where: 'w', group: 'g', order: 'r', and: 'a', or: 'o', entity: 'e' },
  //   value: { ascend: 'c', descend: 'd', number: 'n', string: 't', boolean: 'b' }
  //   }

  //   const f = new Filter(dictionary)

  //   const result = f.toString(filter)

  //   console.log(result)

  //   expect(result).toEqual(`${dictionary.key.query}${dictionary.delimiter?.start}${dictionary.key.select}${dictionary.delimiter?.start}id${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter.item}name${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter.item}title${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter.item}users${dictionary.delimiter?.value}${dictionary.key.query}${dictionary.delimiter?.start}${dictionary.key.select}${dictionary.delimiter?.start}login${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter.item}email${dictionary.delimiter?.value}${dictionary.value.string}${dictionary.delimiter?.end}${dictionary.key.where}${dictionary.delimiter?.start}${dictionary.key.and}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}active${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}true${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.key.where}${dictionary.delimiter?.start}${dictionary.key.and}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}title${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}Test-1700884873036${dictionary.delimiter?.end}${dictionary.key.entity}${dictionary.delimiter?.start}users.tries${dictionary.delimiter?.value}gt${dictionary.delimiter?.value}0${dictionary.delimiter?.value}lt${dictionary.delimiter?.value}10${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.key.or}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}name${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}se${dictionary.delimiter?.end}${dictionary.key.entity}${dictionary.delimiter?.start}name${dictionary.delimiter?.value}not in${dictionary.delimiter?.value}a${dictionary.delimiter?.array}b${dictionary.delimiter?.end}${dictionary.key.and}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}userId${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}1${dictionary.delimiter.item}name${dictionary.delimiter?.value}like${dictionary.delimiter?.value}du${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.key.and}${dictionary.delimiter?.start}${dictionary.key.entity}${dictionary.delimiter?.start}userId${dictionary.delimiter?.value}eq${dictionary.delimiter?.value}2${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.delimiter?.end}${dictionary.key.order}${dictionary.delimiter?.start}id${dictionary.delimiter?.value}${dictionary.value.descend}${dictionary.delimiter?.end}${dictionary.key.group}${dictionary.delimiter?.start}name${dictionary.delimiter.item}title${dictionary.delimiter?.end}${dictionary.delimiter?.end}`)

  //   const q = f.toFilter(result) 

  //   console.log(Deno.inspect(q, { depth: 7}))

  //   expect(q).toEqual(filter)
  // })

})