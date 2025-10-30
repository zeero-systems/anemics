import { DecorationFunctionType, Decorator } from '@zeero/commons';

import PostAnnotation from '~/controller/annotations/post.annotation.ts';

export const Post: DecorationFunctionType<typeof PostAnnotation> = Decorator.create(PostAnnotation);

export default Post;
