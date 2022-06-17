import { assertEquals, faker } from '../src/dev-deps.ts';
import { BookMarkCollection, BookMark } from '../src/bookmarks.ts';

const makeCollection = (starter={}) => {
    const collection = new BookMarkCollection();
    collection.bookmarks = starter;
    return collection;
};

Deno.test('bookmarks', async (t) => {
    await t.step('beginning', () => {
        assertEquals(1, 1);
    });

    await t.step('put for create', async () => {
        const collection = makeCollection();
        const bm = new BookMark(`${faker.internet.userName()}@${faker.internet.ip()}`, faker.lorem.word());
        console.log(collection);

        const returnCode = collection.put(bm);
        assertEquals(returnCode, 0);
        assertEquals(collection.bookmarks[`${bm.name}`].name, bm.name);
        assertEquals(collection.bookmarks[`${bm.name}`].connectionString, bm.connectionString);
    })

    await t.step('put for update', async () => {
        const collection = makeCollection({"quibusdam":{"connectionString":"Glennie_Gottlieb@84.182.105.14","name":"quibusdam"}});
        // before state
        assertEquals(collection.bookmarks['quibusdam'].name, 'quibusdam');
        assertEquals(collection.bookmarks['quibusdam'].connectionString, 'Glennie_Gottlieb@84.182.105.14');

        // do the thing
        const bm = new BookMark(`${faker.internet.userName()}@${faker.internet.ip()}`, 'quibusdam');
        console.log(collection);

        // after state
        const returnCode = collection.put(bm);
        assertEquals(returnCode, 0);
        assertEquals(collection.bookmarks[`${bm.name}`].name, bm.name);
        assertEquals(collection.bookmarks[`${bm.name}`].connectionString, bm.connectionString);
    })
})
