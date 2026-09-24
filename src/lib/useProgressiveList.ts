import { useEffect, useState } from 'react';

/**
 * Splits a long list's first render into two passes.
 *
 * A screen whose list is a hundred-odd cards builds every one of them before
 * the browser is allowed to paint anything, so the tap that opened the screen
 * appears to do nothing until the whole list is laid out. Measured on device,
 * the 114-item surah index froze the screen for about a second that way, and it
 * is the same shape of stall on every other long list in the app.
 *
 * This does not reduce the work. It moves the bulk of it out of the commit the
 * user is waiting on: the first screenful paints immediately, the rest arrives
 * on a later frame, below the fold where it already was.
 *
 * Why two nested frames rather than one: `useEffect` runs after the commit but
 * the browser has not necessarily painted yet. The first frame callback lands
 * before that paint; scheduling from inside it puts the second batch after it.
 *
 * Returns how many items to render. Once the full list has been reached it
 * stays there, so filtering or re-rendering never re-stages a list the user is
 * already looking at — only a fresh mount starts from the first batch again.
 *
 * @param total   Length of the list about to be rendered.
 * @param initial Items in the first pass. The default comfortably fills a phone
 *                screen; pass a smaller number for taller rows.
 */
export function useProgressiveList(total: number, initial = 24): number {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    if (count >= total) return;

    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setCount(total));
    });

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [count, total]);

  // A search can shrink the list below what has already been revealed.
  return Math.min(count, total);
}
