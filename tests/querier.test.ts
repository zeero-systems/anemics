
import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';
import Sql from '~/querier/services/sql.service.ts';

describe('querier', () => {
  let query = new Sql()

  it('basic query', () => {
    query = new Sql().select.column('*').from.table('users')

    expect(query.toQuery().text).toEqual('SELECT * FROM users')
  })

  it('common query', () => {
    query = new Sql()
      .select.column('*')
      .from.table('users', 'u')
      .where.and('u.id', 'EQ', 10)
      .order.desc('u.name')
    
    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u WHERE u.id = 10 ORDER BY u.name DESC')
  })

  it('with subquery', () => {
    query = new Sql()
      .select.column('*')
      .from.table('u', (bracket) => {
        return bracket.select.column('*').from.table('users')
      })
      .where.and('u.id', 'EQ', 10)
      .order.desc('u.name')
    
    expect(query.toQuery().text).toEqual('SELECT * FROM (SELECT * FROM users) AS u WHERE u.id = 10 ORDER BY u.name DESC')
  })

  it('join query', () => {
    query = new Sql()
      .select.column('*')
      .from.table('users', 'u')
      .left.table('posts', 'p')
        .where.and('u.id', 'EQ', 'p.userId')
      .order.desc('u.name')

    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u LEFT JOIN posts AS p WHERE u.id = p.userId ORDER BY u.name DESC')
  })

  it('multiple join query', () => {
    query = new Sql()
      .select.column('*').column('COUNT(id)')
      .from.table('users', 'u')
      .left.table('posts', 'p')
        .where.and('u.id', 'EQ', 10)
      .inner.table('comments', 'c')
        .using.and('u.id', 'EQ', 'c.userId')
      .order.desc('u.name')

    expect(query.toQuery().text).toEqual('SELECT *, COUNT(id) FROM users AS u LEFT JOIN posts AS p WHERE u.id = 10 INNER JOIN comments AS c USING u.id = c.userId ORDER BY u.name DESC')
  })

  it('with raw query', () => {
    query = new Sql()
      .select.column('*')
      .raw.text('FROM users AS u')
      .order.desc('u.name').asc('u.birthdate')

    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u ORDER BY u.name DESC, u.birthdate ASC')
  })

  it('only raw query', () => {
    query = new Sql().raw.text('SELECT * FROM users AS u')

    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u')
  })

})