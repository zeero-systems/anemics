// import Module from '~/module/annotations/module.annotation.ts';
// import Bootstraper from '~/bootstraper/services/bootstraper.service.ts';
// import Controller from '~/controller/annotations/controller.annotation.ts';
// import Get from '~/controller/annotations/get.annotation.ts';
// import { Source } from './src/databaser/services/source.service.ts';
// import { SourceInterface } from '~/databaser/interfaces.ts';
// import { SourceOptionsType } from '~/databaser/types.ts';
// import RequestInterceptor from '~/controller/interceptors/request.interceptor.ts';
// import RouterInterceptor from '~/controller/interceptors/router.interceptor.ts';
// import { Consumer, Provider } from '@zxxxro/commons';
// import Intercept from '~/controller/annotations/intercept.annotation.ts';
// import { InterceptorInterface } from '~/controller/interfaces.ts';
// import { ContextType } from '~/bootstraper/types.ts';
// import { EndpointType } from '~/controller/types.ts';
// import { AdapterEnum } from '~/databaser/enums/AdapterEnum.ts';
// import Put from '~/controller/annotations/put.annotation.ts';
// import { PathInterface, RequesterInterface } from '~/bootstraper/interfaces.ts';
// import Model from '~/controller/annotations/model.annotation.ts';

// @Model()
// export class UserFilterModel {
//   name!: string
// }

// @Intercept('catch')
// export class ExceptionInterceptor implements InterceptorInterface {
//   async onUse<T>(context: ContextType<T & EndpointType>): Promise<void> {
    
//     console.log(context.responser)

//     context.responser.setStatus(500)
//     context.responser.setBody(context.responser.metadata.error.context)
//   }
// }

// @Controller()
// class AnyController {

//   constructor(public postgresService: PostgresService) {}

//   @Get('health')
//   public getStatus() { return 'OK' }

//   @Get('user')
//   public async getUser() {
//     const connection = await this.postgresService.adapter.connection()

//     const transaction = connection.transaction('test_1', { read_only: true })

//     await transaction.begin()
//       const result = await transaction.execute('SELECT * FROM anemics WHERE name IN ($1)', ['Teste 234'])
//     await transaction.commit()

//       console.log('omg', result)
      
//     return result
//   }

//   @Put('user/:id')
//   public async updateUser(userFilterModel: UserFilterModel, path: PathInterface) {
//     const connection = await this.postgresService.adapter.connection()

//     const transaction = connection.transaction(`update_user_${path.id}`)

//     console.log('userFilterModel', userFilterModel)

//     await transaction.begin()
//       const result = await transaction.execute('UPDATE anemics SET name = $2 WHERE id = $1', [path.id, userFilterModel.name])
//     await transaction.commit()

//     console.log('omg', result)
      
//     return result
//   }
// }

// @Consumer()
// @Provider()
// class PostgresService extends Source {
//   constructor(public POSTGRES_OPTIONS: SourceOptionsType) {
//     super(POSTGRES_OPTIONS)
//   }
// }

// @Module({
//   models: [UserFilterModel],
//   consumers: [PostgresService],
//   providers: [{ name: "POSTGRES_OPTIONS", target: {
//     common: {
//       name: 'Test',
//       adapter: AdapterEnum.Postgres
//     },
//     options: {
//       database: 'lxxxb',
//       password: 'npg_hoQswxVMP04n',
//       hostname: 'ep-old-frog-acobiwzs-pooler.sa-east-1.aws.neon.tech',
//       port: 5432,
//       user: 'lxxxb_owner'
//     }
//   } as SourceOptionsType }, PostgresService],
//   controllers: [AnyController],
//   interceptors: [
//     RequestInterceptor,
//     RouterInterceptor, 
//     ExceptionInterceptor
//   ]
// })
// class AppModule {
//   constructor() {}
// }

// async function bootstrap() {
//   const app = Bootstraper.create(AppModule);

//   await app.listen({ port: 5000 }, app.handler);
// }

// bootstrap();

import Querier from '~/querier/services/querier.services.ts';
// const querier = new Querier({ placeholder: '?', placeholderType: 'static' })
//     .from.table('post', 'ad')
//     .select.columns(['title']).distinct()
//     .where
//       .and('images', 'EQ', 10)
//       .and((brackets) => {
//         return brackets.where
//           .or('likes', 'GT', 10)
//           .or('likes', 'LT', 100)
//           .and((brackets) => {
//             return brackets.where.and('date', 'BETWEEN', [2000, 2024])
//           })
//           .or('totalPosts', 'EQ', (brackets) => {
//             return brackets
//               .select.columns(['author'])
//               .select.column('name', (brackets) => {
//                 return brackets
//                   .select.column('name')
//                   .from.table('user')
//                   .where.and('user.firstLogin', 'IS_NOT_NULL')
//               })
//               .from.table('author', (brackets) => {
//                 return brackets
//                   .select.column('name')
//                   .from.table('anotherAuthorTable')
//                   .where.and('email', 'LIKE', '%email.com.br%')
//               })
//               .where
//                 .and('author.id', 'EQ', 10)
//           })
//       })
//       .and('isActive', 'EQ', true)

const querier2 = new Querier({ placeholder: '$' })
    .select.columns(['title'])
    .from.table('post', 'p')
    .join
      .inner('t', (bracket) => {
        return bracket
          .select.columns(['id', 'title'])
          .from.table('tags')
          .where.and('tags.name', 'IS_NOT_NULL')
      })
        .on()
          .and('EXISTS', 'OMG').and('t.id', 'EQ', 11)
      // .inner('user', 'u').using()
      //   .and('u.name', 'EQ', 'eduardo')
    // .where
    //   .and('images', 'EQ', 10)
    //   .and('EXISTS', 'AVVS')
    //   .and('date', 'BETWEEN', [2023, 2024])
    //   .and('tags', 'IN', ['modern', 'abstract', 'nature'])
    //   .and('EXISTS', (bracket) => {
    //     return bracket
    //       .select.column('name')
    //       .from.table('test')
    //       .where.and('p.name', 'EQ', 'eduardo')
    //   })
    // .order.desc('title').desc('images')

console.log(querier2.getQuery())