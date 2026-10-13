import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS, LOAN_PLAN, MEMBERS, isbnFor, pickBooks } from '../lib/data.mjs';
import { demoInstant } from '../lib/client.mjs';

test('the catalog meets the minimums of T-21', () => {
  assert.ok(BOOKS.length >= 40);
  assert.equal(MEMBERS.length, 10);
  assert.equal(LOAN_PLAN.length, 15);
});

test('ISBNs are 13 digits and unique', () => {
  const isbns = BOOKS.map((_, i) => isbnFor(i));
  assert.ok(isbns.every((s) => /^\d{13}$/.test(s)));
  assert.equal(new Set(isbns).size, isbns.length);
});

test('exactly 3 overdue loans: never returned and older than 14 days', () => {
  const overdue = LOAN_PLAN.filter((p) => p.returnedAfter === null && p.daysAgo > 14);
  assert.equal(overdue.length, 3);
  assert.ok(overdue.every((p) => p.books === 1)); // 3 loans -> 3 overdue lines
});

test('open loans are not yet due', () => {
  const open = LOAN_PLAN.filter((p) => p.returnedAfter === null && p.daysAgo <= 14);
  assert.equal(open.length, 2);
});

test('members with an unreturned old loan never get a later loan (no MEMBER_HAS_OVERDUE while seeding)', () => {
  for (const p of LOAN_PLAN.filter((x) => x.returnedAfter === null && x.daysAgo > 14)) {
    const later = LOAN_PLAN.filter((x) => x.member === p.member && x.daysAgo < p.daysAgo);
    assert.equal(later.length, 0);
  }
});

test('per member the loans are chronological and returned before the next one', () => {
  for (let m = 0; m < MEMBERS.length; m++) {
    const mine = LOAN_PLAN.filter((p) => p.member === m).sort((a, b) => b.daysAgo - a.daysAgo);
    for (let i = 0; i < mine.length - 1; i++) {
      assert.notEqual(mine[i].returnedAfter, null);
      assert.ok(mine[i].daysAgo - mine[i].returnedAfter > mine[i + 1].daysAgo);
    }
  }
});

test('a member never exceeds 3 unreturned books at once', () => {
  for (let m = 0; m < MEMBERS.length; m++) {
    const out = LOAN_PLAN.filter((p) => p.member === m && p.returnedAfter === null).reduce((n, p) => n + p.books, 0);
    assert.ok(out <= 3);
  }
});

test('pickBooks returns distinct indexes within range', () => {
  for (let k = 0; k < 20; k++) {
    const ids = pickBooks(k, 3);
    assert.equal(new Set(ids).size, 3);
    assert.ok(ids.every((i) => i >= 0 && i < BOOKS.length));
  }
});

test('demoInstant has no milliseconds and ends with Z', () => {
  assert.equal(demoInstant(new Date('2026-09-20T10:00:00.123Z')), '2026-09-20T10:00:00Z');
});
