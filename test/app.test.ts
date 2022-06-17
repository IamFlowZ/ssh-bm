import { assertEquals } from '../src/dev-deps.ts';

Deno.test('app', async(t) => {
    await t.step('beginning', () => {
        assertEquals(1, 1);
    })
});