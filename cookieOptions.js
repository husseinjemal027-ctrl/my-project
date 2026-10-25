const cookieExpiresDays = Number(process.env.COOKIE_EXPIRES_DAYS || '1');

if (!Number.isInteger(cookieExpiresDays) || cookieExpiresDays < 1) {
  throw new Error('COOKIE_EXPIRES_DAYS must be a positive whole number.');
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: cookieExpiresDays * 24 * 60 * 60 * 1000,
  path: '/',
};

module.exports = cookieOptions;
