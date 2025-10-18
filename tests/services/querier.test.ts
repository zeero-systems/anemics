import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import Index from '~/querier/postgresql/queries/index.querier.ts';
import Query from '~/querier/postgresql/queries/query.querier.ts';
import Table from '~/querier/postgresql/queries/table.querier.ts';
import { QueryFunction } from '@zeero-systems/anemics';
import { QueryQuerierInterface } from '~/querier/interfaces.ts';

describe('querier', () => {
  it('basic query', () => {
    const query = new Query();

    query
      .select.column('*').column('id').column('name')
      .from.table('users')
      .raw.value('AS u');

    expect(query.toQuery().text).toEqual('SELECT *, id, name FROM users AS u');
  });

  it('common query', () => {
    const query = new Query();

    query
      .select.column('*')
      .from.table('users', 'u')
      .where.and('u.id', 'eq', 10)
      .order.desc('u.name');

    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u WHERE u.id = 10 ORDER BY u.name DESC');
  });

  it('with subquery', () => {
    const query = new Query();

    query
      .select.column('*')
      .from.table('u', (query: QueryQuerierInterface) => {
        return query.select.column('*').from.table('users');
      })
      .where.and('u.id', 'eq', 10)
      .order.desc('u.name');

    expect(query.toQuery().text).toEqual(
      'SELECT * FROM (SELECT * FROM users) AS u WHERE u.id = 10 ORDER BY u.name DESC',
    );
  });

  it('join query', () => {
    const query = new Query();

    query
      .select.column('*')
      .from.table('users', 'u')
      .left.table('posts', 'p')
      .on.and('u.id', 'eq', 'p.userId')
      .order.desc('u.name');
    expect(query.toQuery().text).toEqual(
      'SELECT * FROM users AS u LEFT JOIN posts AS p ON u.id = p.userId ORDER BY u.name DESC',
    );
  });

  it('multiple join query', () => {
    const query = new Query();

    query
      .select.column('*').column('COUNT(id)')
      .from.table('users', 'u')
      .left.table('posts', 'p')
      .on.and('u.id', 'eq', 10)
      .left.table('comments', 'c')
      .using.and('u.id', 'eq', 'c.userId')
      .order.desc('u.name');

    expect(query.toQuery().text).toEqual(
      'SELECT *, COUNT(id) FROM users AS u LEFT JOIN posts AS p ON u.id = 10 LEFT JOIN comments AS c USING u.id = c.userId ORDER BY u.name DESC',
    );
  });

  it('with raw query', () => {
    const query = new Query();

    query
      .select.column('*')
      .raw.value('FROM users AS u')
      .order.desc('u.name').asc('u.birthdate');

    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u ORDER BY u.name DESC, u.birthdate ASC');
  });

  it('only raw query', () => {
    const query = new Query();

    query.raw.value('SELECT * FROM users AS u');

    expect(query.toQuery().text).toEqual('SELECT * FROM users AS u');
  });

  it('basic index create', () => {
    const index = new Index();

    index
      .create.name('idx_test')
      .on.table('users')
      .using.type('gist')
      .with.column('nome').column('id');

    expect(index.toQuery().text).toEqual('CREATE INDEX idx_test ON users USING gist (nome, id)');
  });

  it('basic table create', () => {
    const table = new Table();

    table
      .create.name('users')
      .column.name('id').numeric('bigint').primaryKey().notNull()
      .column.name('wallet').numeric('money').notNull()
      .column.name('first').character('varchar', { length: 155 }).notNull()
      .column.name('last').character('varchar', { length: 255 }).notNull()
      .column.name('birthdate').date('date')
      .column.name('hits').numeric('bigserial').default(0)
      .column.name('post_id').numeric('integer')
      .constraint.name('fk_post')
      .foreignKey('post_id')
      .references('posts', { column: 'id' })
      .onDelete('cascade');

    expect(table.toQuery().text).toEqual(
      'CREATE TABLE users (id BIGINT NOT NULL PRIMARY KEY, wallet MONEY NOT NULL, first VARCHAR(155) NOT NULL, last VARCHAR(255) NOT NULL, birthdate DATE, hits BIGSERIAL, post_id INTEGER, CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE)',
    );
  });

  it('basic table drop', () => {
    const table = new Table();

    table
      .drop.name('users')
      .cascade();

    expect(table.toQuery().text).toEqual('DROP TABLE users CASCADE');
  });

  it('basic insert', () => {
    const query = new Query();

    query
      .insert.table('users')
      .column('wallet', 4.33)
      .column('first', '')
      .column('last', 'segura')
      .column('hits');

    expect(query.toQuery().text).toEqual(
      "INSERT INTO users (wallet, first, last, hits) VALUES ('4.33', '', 'segura', DEFAULT)",
    );
  });

  it('basic update', () => {
    const query = new Query();

    query
      .update.table('users')
      .column('wallet', 5.33)
      .column('first', 'eduardo')
      .column('hits')
      .where.and('users.id', 'eq', 1);

    expect(query.toQuery().text).toEqual(
      "UPDATE users SET wallet = '5.33', first = 'eduardo', hits = 'DEFAULT' WHERE users.id = 1",
    );
  });

  it('basic delete', () => {
    const query = new Query();

    query
      .delete.table('users')
      .where.and('users.name', 'in', ["'Eduardo'", "'Segura'"]);

    expect(query.toQuery().text).toEqual("DELETE FROM users WHERE users.name IN ('Eduardo', 'Segura')");
  });

});
