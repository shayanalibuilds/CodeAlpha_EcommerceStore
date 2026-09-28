import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { startDb, stopDb, clearDb, api, createCustomer } from './helpers.js';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe('POST /api/auth/register', () => {
  it('creates a customer account and returns a token', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Ayesha Khan', email: 'ayesha@example.com', password: 'bookworm-2024' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toMatchObject({ name: 'Ayesha Khan', email: 'ayesha@example.com', role: 'customer' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('never trusts a client-supplied role', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Sneaky Sam', email: 'sneaky@example.com', password: 'password-12345', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('customer');
  });

  it('explains how to fix a short password', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Shorty', email: 'shorty@example.com', password: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body.fields.password).toMatch(/8 characters/);
  });

  it('rejects a malformed email with a field error', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Bad Email', email: 'not-an-email', password: 'password-12345' });

    expect(res.status).toBe(400);
    expect(res.body.fields.email).toMatch(/email/i);
  });

  it('rejects duplicate email with 409', async () => {
    await api()
      .post('/api/auth/register')
      .send({ name: 'First One', email: 'dupe@example.com', password: 'password-12345' });
    const res = await api()
      .post('/api/auth/register')
      .send({ name: 'Second One', email: 'dupe@example.com', password: 'password-67890' });

    expect(res.status).toBe(409);
    expect(res.body.fields.email).toMatch(/already registered/);
  });
});

describe('POST /api/auth/login', () => {
  it('issues a token for valid credentials', async () => {
    await api()
      .post('/api/auth/register')
      .send({ name: 'Login Tester', email: 'login@example.com', password: 'password-12345' });
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password-12345' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('customer');
  });

  it('rejects a wrong password with 401', async () => {
    await api()
      .post('/api/auth/register')
      .send({ name: 'Login Tester', email: 'wrongpw@example.com', password: 'password-12345' });
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'wrongpw@example.com', password: 'totally-wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/incorrect/i);
  });

  it('rejects an unknown email with 401', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password-12345' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('is isolated: requests without a token get 401', async () => {
    const res = await api().get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage token with 401', async () => {
    const res = await api().get('/api/auth/me').set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
  });

  it('returns the current user for a valid token', async () => {
    const { token, user } = await createCustomer();
    const res = await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: user.id, email: user.email, role: 'customer' });
  });
});

describe('POST /api/auth/logout', () => {
  it('responds ok (client drops the token)', async () => {
    const { token } = await createCustomer();
    const res = await api().post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
