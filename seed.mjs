#!/usr/bin/env node
// Manager Library demo seeder. Works ONLY through the public API (task T-21): >= 40 books, 10 members, 15 loans, 3 overdue.
// Past loans are created with the `X-Demo-Now` header, which the API honors only when it runs with APP_ENV=demo.
import { randomBytes } from 'node:crypto';
import { Api, ApiError, demoInstant } from './lib/client.mjs';
import { BOOKS, LOAN_PLAN, MEMBERS, daysAfter, daysAgo, isbnFor, pickBooks } from './lib/data.mjs';

const env = (k, d) => process.env[k] ?? d;
const API_URL = env('API_URL', 'http://localhost:8000/api/v1');
const ADMIN_USERNAME = env('ADMIN_USERNAME');
const ADMIN_PASSWORD = env('ADMIN_PASSWORD');
if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD (see .env.example).');
  process.exit(1);
}

const log = (m) => console.log(m);
const api = new Api(API_URL);
const now = new Date();

async function main() {
  log(`Seeding ${API_URL}`);
  await api.login(ADMIN_USERNAME, ADMIN_PASSWORD);

  // 1. A librarian, to show both roles.
  const librarianPassword = env('SEED_LIBRARIAN_PASSWORD') || randomBytes(9).toString('base64url');
  try {
    await api.request('POST', '/users', { body: { username: 'bibliotecario', password: librarianPassword, role: 'librarian' } });
    log(`Librarian "bibliotecario" created${env('SEED_LIBRARIAN_PASSWORD') ? '' : ` — password (shown once): ${librarianPassword}`}`);
  } catch (e) {
    if (!(e instanceof ApiError && e.code === 'USERNAME_TAKEN')) throw e;
    log('Librarian already exists');
  }

  // 2. Books (idempotent by ISBN).
  const categories = new Map((await api.request('GET', '/categories')).items.map((c) => [c.name, c.id]));
  const existingBooks = new Map((await api.all('/books')).map((b) => [b.isbn, b]));
  const books = [];
  for (const [i, b] of BOOKS.entries()) {
    const isbn = isbnFor(i);
    let book = existingBooks.get(isbn);
    if (!book) {
      const categoryId = categories.get(b.category);
      if (!categoryId) throw new Error(`Category "${b.category}" is not in the API`);
      book = await api.request('POST', '/books', {
        body: { title: b.title, author: b.author, isbn, category_id: categoryId, total_copies: b.copies },
      });
    }
    books.push(book);
  }
  log(`Books: ${books.length}`);

  // 3. Members (idempotent by document number).
  const existingMembers = new Map((await api.all('/members')).map((m) => [m.document_number, m]));
  const members = [];
  for (const m of MEMBERS) {
    members.push(existingMembers.get(m.document_number) ?? (await api.request('POST', '/members', { body: m })));
  }
  log(`Members: ${members.length}`);

  // 4. Loans in the past, only if this member has no history yet (keeps the script re-runnable).
  const already = (await api.all('/loans')).length;
  if (already > 0) {
    log(`Loans: ${already} already exist — not creating more.`);
  } else {
    let k = 0;
    for (const plan of LOAN_PLAN) {
      const member = members[plan.member];
      const loanedAt = daysAgo(now, plan.daysAgo);
      const bookIds = pickBooks(k++, plan.books).map((idx) => ({ book_id: books[idx].id }));
      const loan = await api.request('POST', '/loans', { body: { member_id: member.id, items: bookIds }, now: loanedAt });
      if (Math.abs(new Date(loan.loaned_at) - now) < 5 * 60_000) {
        throw new Error('The API ignored X-Demo-Now. Start it with APP_ENV=demo (infra/.env) and run the seeder again.');
      }
      if (plan.returnedAfter !== null) {
        const returnedAt = daysAfter(loanedAt, plan.returnedAfter);
        for (const item of loan.items) {
          await api.request('POST', `/loans/${loan.id}/items/${item.id}/return`, { now: returnedAt });
        }
      }
    }
    log(`Loans created: ${LOAN_PLAN.length}`);
  }

  // 5. Evidence.
  const overdue = await api.request('GET', '/loans/overdue');
  log(`Overdue lines: ${overdue.items.length}`);
  const from = demoInstant(daysAgo(now, 60)).slice(0, 10);
  const to = demoInstant(now).slice(0, 10);
  const report = await api.request('GET', '/reports/most-borrowed', { query: { from, to } });
  log(`Report ${from}..${to}: ${report.rows.length} rows; top: ${report.rows[0]?.book_title ?? '—'} (${report.rows[0]?.times_borrowed ?? 0})`);
}

main().catch((e) => {
  console.error(e instanceof ApiError ? `API error — ${e.message}` : e);
  process.exit(1);
});
