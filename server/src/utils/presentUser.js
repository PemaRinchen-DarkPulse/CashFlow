const filebase = require('../services/filebase');

/**
 * The shape a user leaves the API in.
 *
 * Avatar and cover are swapped for freshly signed links. What is stored is the
 * object's own URL, which is stable but private — fetching it without the
 * account's keys answers 403. Signing on read means the link is always current
 * and the database never holds an expiring one.
 */
async function presentUser(user) {
  const shape = user.toPublic();
  const [avatar, cover] = await Promise.all([
    user.avatar?.key ? filebase.signedUrl(user.avatar.key) : null,
    user.cover?.key ? filebase.signedUrl(user.cover.key) : null,
  ]);
  return {
    ...shape,
    avatar: avatar || undefined,
    cover: cover || undefined,
  };
}

module.exports = presentUser;
