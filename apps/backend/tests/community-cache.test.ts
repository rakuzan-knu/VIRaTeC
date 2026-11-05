import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CommunityService } from '../dist/community/community.service.js';

interface FakePost {
  id: string;
  likesCount: number;
  author: { id: string; name: string };
}

function buildService() {
  const posts: FakePost[] = [
    { id: 'p1', likesCount: 2, author: { id: 'a1', name: 'Author One' } },
    { id: 'p2', likesCount: 0, author: { id: 'a2', name: 'Author Two' } },
  ];
  let findManyCalls = 0;

  const prisma = {
    communityPost: {
      findMany: async () => {
        findManyCalls += 1;
        return posts.map((post) => structuredClone(post));
      },
    },
    postLike: {
      findMany: async ({ where }: { where: { userId: string; postId: { in: string[] } } }) =>
        where.userId === 'viewer-1' ? [{ postId: 'p1' }] : [],
    },
  };

  const rateLimit = { consume: async () => {}, reset: async () => {} };
  const service = new CommunityService(prisma as never, rateLimit as never);
  return { service, calls: () => findManyCalls };
}

test('community list caches the viewer-independent page but likedByMe is per viewer', async () => {
  const { service, calls } = buildService();

  const anon = await service.findAll({ limit: 10 }, null);
  const viewer = await service.findAll({ limit: 10 }, 'viewer-1');

  assert.equal(calls(), 1, 'the underlying post query runs once and is served from cache');

  type Row = { id: string; likedByMe: boolean };
  const anonLiked = Object.fromEntries(anon.data.map((p: Row) => [p.id, p.likedByMe]));
  const viewerLiked = Object.fromEntries(viewer.data.map((p: Row) => [p.id, p.likedByMe]));

  assert.equal(anonLiked.p1, false, 'anonymous viewer never sees likedByMe true');
  assert.equal(anonLiked.p2, false);
  assert.equal(viewerLiked.p1, true, 'the viewer who liked p1 sees it as liked');
  assert.equal(viewerLiked.p2, false, 'the viewer has not liked p2');
});
