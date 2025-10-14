import type { CommonOptionsType} from '~/storer/types.ts';
import type { DatabaseInterface } from '~/storer/interfaces.ts';
import type { FilterType } from '~/querier/types.ts';

import { describe, it } from '@std/bdd';
import { expect } from '@std/expect';

import { Factory } from '@zeero/commons';
import Schema from '~/storer/decorations/schema.decoration.ts';
import Numeric from '~/storer/decorations/numeric.decoration.ts';
import Character from '~/storer/decorations/character.decoration.ts';
import Postgres  from '~/storer/services/postgres.service.ts';
import ForeignKey from '~/storer/decorations/foreign-key.decoration.ts';
import Repository from '~/persister/services/repository.service.ts';
import Many from '~/storer/decorations/many.decoration.ts';
import Structure from '~/storer/decorations/structure.decoration.ts';
import One from '~/storer/decorations/one.decoration.ts';

describe('persister', () => {

  @Schema('users')
  class User {
    // @TODO change this numeric to the base types eg: Serial()
    @Numeric('serial', { primary: true })
    id?: number

    @Character('varchar')
    name!: string

    @Character('varchar', { length: 10 })
    lastName!: string

    @Many(() => Post, { 
      foreignKey: 'userId',
      filter: { where: { and: [{ 'posts.status': { eq: 'active' } }] } }
    })
    posts?: Post[]
  }

  @Schema('posts')
  // @Index()
  // @Relation('users', { foreignField: 'id' })
  class Post {
    @Numeric('serial', { primary: true })
    id?: number

    @Character('varchar')
    title!: string

    @Structure('boolean')
    active!: boolean

    @Numeric('integer')
    @ForeignKey('users', { referenceKey: 'id', onDelete: 'cascade' })
    userId!: number

    @Many(() => Comment, { 
      foreignKey: 'postId',
      filter: { where: { and: [{ 'comments.message': { like: '%Hello%' } }] } }
    })
    comments?: Comment[]

    @One(() => User, { localKey: 'userId' })
    user!: User
  }

  @Schema('comments')
  // @Index()
  // @Relation('users', { foreignField: 'id' })
  class Comment {
    @Numeric('serial', { primary: true })
    id?: number

    @Character('varchar')
    message!: string

    @Numeric('integer')
    @ForeignKey('users', { referenceKey: 'id', onDelete: 'cascade' })
    userId!: number

    @Numeric('integer')
    @ForeignKey('posts', { referenceKey: 'id', onDelete: 'cascade' })
    postId!: number

    // @TODO on insert, if this value exists auto insert this as well
    // @OneRight('users', { where: 'id:eq:user_id' })
    // user!: User
  }

  const commonOptions: CommonOptionsType = { 
    name: 'fake', 
    naming: {} as any,
    placeholder: '$',
    placeholderType: 'counter'
  }

  const clientOptions = {
    database: 'postgres',
    hostname: '127.0.0.1',
    password: 'your-super-secret-and-long-postgres-password',
    port: 5432,
    schema: 'public',
    user: 'postgres.your-tenant-id',
  }
  
  const database: DatabaseInterface = new Postgres(commonOptions, clientOptions)
  const userRepository = new Repository(User, database)
  const postRepository = new Repository(Post, database)
  const commentRepository = new Repository(Comment, database)

  // it('repository create tables', async () => {
  //   await userRepository.table.create()
  //   await postRepository.table.create()
  //   await commentRepository.table.create()
  // })
  // let userC: any
  // it('repository insert records', async () => {
  //   const userA = Factory.properties(User, { name: 'Eduardo', lastName: 'Segura' })
  //   const userB = Factory.properties(User, { name: 'Maximiliano', lastName: 'Bitencourt' })
  //   userC = Factory.properties(User, { name: 'Andres', lastName: 'ooops' } )
    
  //   const userCreateResults = await userRepository.record.createMany([userA, userB, userC])  

  //   expect(userCreateResults.length).toEqual(3);

  //   userC = userCreateResults[2]

  //   let lastActive = true
  //   for (const userResult of userCreateResults) {
  //     const post = Factory.properties(Post, { userId: userResult.id as number, title: `Test-${Date.now()}`, active: lastActive = !lastActive })

  //     const postCreateResult = await postRepository.record.create(post)

  //     expect(postCreateResult.id).toBeDefined()

  //     if (userResult.id && postCreateResult.id) {
  //       const commentA = Factory.properties(Comment, { message: `Hello from ${Date.now()}`, userId: userResult.id, postId: postCreateResult.id })

  //       const commentCreateResult = await commentRepository.record.create(commentA)

  //       expect(commentCreateResult.id).toBeDefined()
  //     }
  //   }
  // })

  it('repository search records', async () => {

    const commentsFilter: FilterType = {
      select: '*'
    }

    const postsFilter: FilterType = {
      select: { title: 'string', id: 'number', active: 'boolean', comments: commentsFilter, user: { select: '*' } },
      // where: { or: [{ active: { eq: false } }] }
      order: { id: 'desc' }
    }

    const options: FilterType =  {
      select: { name: 'string', lastName: 'string', posts: postsFilter },
      // where: {
      //   or: [
      //     { name: { eq: 'Eduardo' } },
      //     { name: { eq: 'Maximiliano' } },
      //     { or: [
      //       { lastName: { eq: 'Segura' } },
      //     ] }
      //   ] 
      // }
    }

    // console.log(userRepository.record.searchQuery(options))
//     const q = `
// SELECT
//   users.id,
//   users.name as nane,
//   users.last_name as last_name,
//   COALESCE(
//     json_agg(json_build_object('id', posts.id, 'title', posts.title, 'comments', posts.comments)) 
//     FILTER (WHERE posts.id IS NOT NULL), '[]'::json
//   ) as posts
// FROM users 
// LEFT JOIN (
//   SELECT 
//     posts.id,
//     posts.user_id,
//     posts.title,
//     COALESCE(
//       json_agg(json_build_object('id', comments.id, 'message', comments.message))
//       FILTER (WHERE comments.id IS NOT NULL), '[]'::json
//     ) as comments
//   FROM posts
//   LEFT JOIN comments ON comments.post_id = posts.id
//   GROUP BY posts.id, posts.title, posts.user_id
// ) AS posts ON posts.user_id = users.id
// GROUP BY users.id, users.name, users.last_name`

//     const agg = await userRepository.executeWithConnect([{ args: [], text: q }])

//     console.log(Deno.inspect(agg, { depth: 10 }))

    const userResults = await userRepository.record.search(options)    

    console.log(userResults)

    // expect(userResults.length).toBeGreaterThan(0)
  })

  it('repository update records', async () => {
    // const userAreateResult = await userRepository.record.update({ id: userC.id, lastName: 'Castro' })

    // expect(userAreateResult.id).toBe(userC.id)
  })

  // it('repository delete records', async () => {
  //   const deleteFilter: FilterPredicateType = { and: [ { id: { 'is not null': true } }] }
  //   const userDeleteResult = await userRepository.record.delete(deleteFilter, { returning: ['id'] })

  //   expect(userDeleteResult.id).not.toBeUndefined()
  // })

  // it('repository drop tables', async () => {
  //   const postDrop = await postRepository.table.drop('cascade')
  //   const userDrop = await userRepository.table.drop('cascade')
    
  //   expect(userDrop).toEqual(true)
  //   expect(postDrop).toEqual(true)
  // })

})


// @todo

// anemics
// x refactor to be able to use only specifics parts of the systems

// anemics: querier
// test performance usign object.assign. Change class methods to properties to use spreading
// x add parameters to the currente implementation with counter of placeholders, even the recursive ones
// x put everything in files
// add tests for a more use cases
// - implement a lot more of the sql syntax
// x add raw to everything added until now
// x add skipBinding to everything added until now (per instance configuration, default: no binding)
// add a cache mechanism to save the reusable generated query type [text, args]

// anemics: databaser
// implement a mongodb driver
// implement a query builder for mongo

// commons
// x refactor to be able to use only specifics parts of the systems
// implement a lot of more validators
